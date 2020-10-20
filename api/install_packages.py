import subprocess
import sys
process = subprocess.Popen(['python3', '-m', 'pip', 'install', sys.argv[1]], stdout = subprocess.PIPE)
output, error = process.communicate()
output = output.decode("utf-8").split('\n')
print('Test')
print(output)