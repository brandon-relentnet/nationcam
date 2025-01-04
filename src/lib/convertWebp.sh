#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it first."
    exit 1
fi

# Hard-coded input and output directories
input="../../public/temp/png"
output="../../public/temp/webp"

# Compression quality (adjust as needed, default 80)
quality=80

# Check if input directory exists
if [ ! -d "$input" ]; then
    echo "Input directory $input does not exist."
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$output"

# Function to convert a single PNG file to WebP
convert_png_to_webp() {
    local file="$1"
    local base_name=$(basename "$file" .png)
    local output_file="$output/$base_name.webp"

    echo "Converting $file to $output_file with quality $quality..."
    convert "$file" -quality "$quality" "$output_file"

    if [ $? -eq 0 ]; then
        echo "Successfully converted: $output_file"
    else
        echo "Failed to convert: $file"
    fi
}

# Find all PNG files in the input directory and convert them
find "$input" -type f -name "*.png" | while read -r png_file; do
    convert_png_to_webp "$png_file"
done
