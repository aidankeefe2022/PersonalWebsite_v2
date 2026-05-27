#!/usr/bin/env bash


if !(./scripts/test_fast.sh) ; then #if tests fail then we dont continue
  echo -e "\n\n\\e[1;31m Error in tests exited build process.\\e[0m"
  exit 1
fi


gcc -c -Iinclude -lAidan -lwolfssl -lctmpl -lhttps -Wall -fPIC main.c -o main.o
gcc -shared -o libctmpl.so main.o
sudo mv libctmpl.so /usr/lib/
sudo ldconfig

libdir=/usr/include/ctmpl

sudo mkdir -p $libdir

for file in ./include/*.h; do
  sudo cp $file $libdir
done