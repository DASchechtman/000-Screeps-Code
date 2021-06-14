import os

def ReadFile(path):
    output = []
    with open(path, "r") as f:
        output = f.readlines()
    return output

def RestructReqPath(line):
    found_slash = False
    start = line.index("(")
    tmp_line = ""

    for c in range(len(line)-1, -1, -1):
        ch = line[c]

        if ch == "/":
            found_slash = True

        if not found_slash:
            tmp_line = f"{ch}{tmp_line}"
        elif c <= start:
            if c == start:
                tmp_line = f"\"./{tmp_line}"
            tmp_line = f"{ch}{tmp_line}"

    return tmp_line

def EditText(text_file):
    edit_output = []

    for i in range(len(text_file)):
        line = text_file[i]
        if "= require(" in line:
            line = RestructReqPath(line)
        edit_output.append(line)
        
    return edit_output

def WriteFile(text_file, file_name):
    path = "./js"

    if not os.path.exists(path):
        os.mkdir(path)
    
    with open(f"{path}/{file_name}", "w") as f:
        f.writelines(text_file)


def CopyFiles(path):
    for (dirpath, dirnames, filenames) in os.walk(path):
        for name in filenames:
            path = f"{dirpath}/{name}"
            file_text = ReadFile(path)
            changed_text = EditText(file_text)
            WriteFile(changed_text, name)

if __name__ == "__main__":
    CopyFiles("./dist")