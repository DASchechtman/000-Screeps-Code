import shutil
import os

SOURCE = "C:/Users/dsche/OneDrive/Desktop/Screeps Script/dist"
DEST = "C:/Users/dsche/AppData/Local/Screeps/scripts/10_0_0_107___21126/main"


def CopyFile(src, dest):
    for cur_path, dirs, files in os.walk(src):
        for f in files:
            shutil.copy(f"{cur_path}/{f}", dest)

CopyFile(SOURCE, DEST)
