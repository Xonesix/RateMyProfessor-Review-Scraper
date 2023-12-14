import pandas as pd
import base64

# 1. Read the CSV

# Enter Path To CSV Here
df = pd.read_csv('./names.csv', header=None)

# 2. Remove rows with "Not Found"
df = df[df[1] != "Not Found"]

# 3. Remove all rows with entirely missing data
df = df.dropna(how='all')

# Reset index after dropping rows
df = df.reset_index(drop=True)

# 4. Add 'base64ID' column
df['base64ID'] = df[1].apply(lambda x: base64.b64encode(('Teacher-' + str(x)).encode()).decode())

# 5. Write the updated data back to the CSV, with column names
df.to_csv('b64.csv', index=False, header=[0, 1, 'base64ID'])
