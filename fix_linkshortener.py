#!/usr/bin/env python3
import re

# Read the file
with open('LinkShortener.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the creation secret section using regex
# Pattern to match the entire creation secret conditional block
pattern = r'\s*{/\* Creation Secret \*/}\s*{\s*shortenedLink\.creationSecret &&[\s\S]*?}\)\s*}'

# Replace with empty string
cleaned_content = re.sub(pattern, '', content)

# Also remove any remaining creationSecret references
cleaned_content = re.sub(r'creationSecret\?:\s*string;?\s*', '', cleaned_content)

# Write the cleaned file
with open('LinkShortener_clean.tsx', 'w', encoding='utf-8') as f:
    f.write(cleaned_content)

print("File cleaned successfully!")
