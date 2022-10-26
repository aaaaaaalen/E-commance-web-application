import os
import shutil

try:
    os.mkdir("flattened")
except:
    pass

# Just a simple script to extract our own js files for assignment submission
# Why Python? Cause I suck at bash scripting lol
for root, dirs, files in os.walk('.'):
    if ("node_modules" not in root and ".git" not in root and "flattened" not in root):
        prefix = "./flattened/" + "_".join(root.strip("./").split("/"))
        for file in files:
            if (".js" in file and ".json" not in file):
                original_path = root + "/" + file
                new_path = prefix + "_" + file
                
                print(original_path + " copied to: " + new_path)
                shutil.copyfile(original_path, new_path)
    

# We expect 23 files