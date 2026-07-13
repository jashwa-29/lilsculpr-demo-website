import os
from PIL import Image

def generate_favicons():
    # Source image path
    source_img = "Group 427320786.png"
    
    # Check if the source image exists
    if not os.path.exists(source_img):
        print(f"Error: {source_img} not found.")
        return

    # Open the image
    img = Image.open(source_img)

    # List of sizes and corresponding output filenames
    sizes = [
        ((48, 48), "favicon-48x48.png"),
        ((32, 32), "favicon-32x32.png"),
        ((16, 16), "favicon-16x16.png"),
        ((192, 192), "android-chrome-192x192.png"),
        ((512, 512), "android-chrome-512x512.png"),
        ((180, 180), "apple-touch-icon.png")
    ]

    for size, filename in sizes:
        # Resize using LANCZOS for high quality
        resized_img = img.resize(size, Image.Resampling.LANCZOS)
        resized_img.save(filename)
        print(f"Generated {filename}")

    # Generate favicon.ico (multi-size)
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
    img.save("favicon.ico", format="ICO", sizes=ico_sizes)
    print("Generated favicon.ico")

if __name__ == "__main__":
    generate_favicons()
