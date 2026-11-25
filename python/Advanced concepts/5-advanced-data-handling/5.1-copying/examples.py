from copy import deepcopy

original = [[1]]
shallow = original.copy()
deep = deepcopy(original)
original[0].append(2)
print(shallow)
print(deep)
