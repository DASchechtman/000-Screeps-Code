import os

lines_total = 0

def ReadFile(path):
    global lines_total
    output = []
    with open(path, "r") as f:
        output = f.readlines()
    lines_total += len(output)
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

def WriteFile(text_file, file_name, path_to):
    
    with open(f"{path_to}/{file_name}", "w") as f:
        f.writelines(text_file)


def CopyFiles(path_from, path_to):
    for (dirpath, dirnames, filenames) in os.walk(path_from):
        for name in filenames:
            file_path = f"{dirpath}/{name}"
            file_text = ReadFile(file_path)
            changed_text = EditText(file_text)
            WriteFile(changed_text, name, path_to)
    print(f"total number of lines: {lines_total}")

if __name__ == "__main__":
    path_to = "./js"
    path_from = "./dist"
    if not os.path.exists(path_to):
        os.mkdir(path_to)
    CopyFiles(path_from, path_to)