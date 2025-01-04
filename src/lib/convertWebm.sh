#!/bin/bash

INPUT_FOLDER="../../public/temp"
OUTPUT_FOLDER="../../public/videos/webm"

mkdir -p "$OUTPUT_FOLDER"

for file in "$INPUT_FOLDER"/*.mp4; do
    if [[ -f "$file" ]]; then
        base_name=$(basename "$file" .mp4)
        output_file="$OUTPUT_FOLDER/${base_name}.webm"

        echo "Compressing $file to $output_file..."

        # Two-pass approach with reduced resolution and frame rate
        ffmpeg -i "$file" \
            -c:v libvpx-vp9 \
            -crf 30 \
            -b:v 0 \
            -vf "scale=1280:-1,fps=30" \
            -an \
            "$output_file"

        # Clean up pass logs (vp9 uses ffmpeg2pass-0.log, etc.)
        rm -f ffmpeg2pass-0.log*

        echo "Finished compressing $file"
    else
        echo "No MP4 files found in $INPUT_FOLDER."
    fi
done

echo "Batch compression completed!"
