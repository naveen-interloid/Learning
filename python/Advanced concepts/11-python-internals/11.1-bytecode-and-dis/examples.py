import dis

code = compile("total = 2 + 3", "<example>", "exec")
instructions = list(dis.get_instructions(code))
print(code.co_name)
print(bool(instructions))
