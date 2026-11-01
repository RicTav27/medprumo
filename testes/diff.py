import sys,os
from PIL import Image,ImageChops
a,b=sys.argv[1],sys.argv[2];bad=[]
for n in sorted(os.listdir(a)):
  A=Image.open(f'{a}/{n}').convert('RGB');B=Image.open(f'{b}/{n}').convert('RGB')
  if A.size!=B.size:bad.append((n,'tamanho',A.size,B.size));continue
  d=ImageChops.difference(A,B).getbbox()
  if d:bad.append((n,d))
print('diferenças:',len(bad));[print(x) for x in bad[:40]]
