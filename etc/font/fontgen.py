from PIL import Image, ImageDraw, ImageFont
import numpy as np
import argparse
import json

def render_glyphs(font_path, characters, font_size, output_file):
    font = ImageFont.truetype(font_path, font_size)
    glyph_data = {}
    kerning_pairs = {}

    ascent, descent = font.getmetrics()  # Get font-wide ascent & descent
    max_width, max_height = 0, 0

    # Compute max width and height
    for char in characters:
        bbox = font.getbbox(char)
        width, height = bbox[2] - bbox[0], bbox[3] - bbox[1]
        max_width = max(max_width, width)
        max_height = max(max_height, height)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"Font Metadata: Font Size={font_size}, Ascent={ascent}, Descent={descent}\n\n")

        # Render each character and store glyph data
        for char in characters:
            bbox = font.getbbox(char)
            width, height = bbox[2] - bbox[0], bbox[3] - bbox[1]
            yOffset = ascent - bbox[1]  # Baseline offset
            topBearing = bbox[1]  # Space from top to first pixel of the glyph

            img = Image.new("L", (width, height), 0)
            draw = ImageDraw.Draw(img)
            draw.text((-bbox[0], -bbox[1]), char, font=font, fill=255)

            arr = np.array(img, dtype=np.uint8)
            glyph_data[char] = {
                "width": width,
                "height": height,
                "yOffset": yOffset,  # Helps align glyphs
                "topBearing": topBearing,  # Useful for precise placement
                "bitmap": []
            }

            f.write(f"Glyph {char} (U+{ord(char):04X}): {width}x{height}, yOffset={yOffset}, topBearing={topBearing}\n")
            for row in arr:
                row_str = ''.join(f"{val:02X}" for val in row)
                f.write(row_str + "\n")
                glyph_data[char]["bitmap"].append(row_str)
            f.write("\n")

        # Compute kerning pairs
        f.write("Kerning Pairs:\n")
        for i in range(len(characters) - 1):
            left_char = characters[i]
            right_char = characters[i + 1]

            left_glyph = font.getmask(left_char).getbbox()
            right_glyph = font.getmask(right_char).getbbox()

            if left_glyph and right_glyph:
                left_width = left_glyph[2] - left_glyph[0]
                right_width = right_glyph[2] - right_glyph[0]
                pair_width = font.getlength(left_char + right_char)

                kerning_offset = pair_width - (left_width + right_width)
                if kerning_offset != 0:
                    kerning_pairs[f"{left_char}{right_char}"] = kerning_offset
                    f.write(f"{left_char}{right_char}: {kerning_offset}\n")

    # Save glyph and kerning data in JSON
    with open(output_file.replace('.txt', '.json'), 'w', encoding='utf-8') as f:
        json.dump({
            "glyphs": glyph_data,
            "kerning": kerning_pairs,
            "fontMetrics": {
                "ascent": ascent,
                "descent": descent,
                "lineHeight": ascent + descent
            }
        }, f, indent=4)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("font", help="Path to TTF font file")
    parser.add_argument("--letters", type=str, help="String of characters to render")
    parser.add_argument("--size", type=int, default=32, help="Font size")
    parser.add_argument("--output", type=str, default="output.txt", help="Output text file")
    args = parser.parse_args()

    render_glyphs(args.font, args.letters, args.size, args.output)
