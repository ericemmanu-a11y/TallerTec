import fitz
import glob
import os

pdf_files = glob.glob('*.pdf')
for pdf in pdf_files:
    text = ''
    try:
        doc = fitz.open(pdf)
        for page in doc:
            text += page.get_text()
        
        out_name = pdf + '.txt'
        with open(out_name, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f'Extracted {pdf} to {out_name}')
    except Exception as e:
        print(f'Failed on {pdf}: {e}')
