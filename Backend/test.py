# Original path
full_path = 'C:\\Users\\harsh\\Desktop\\Python Projects\\summaraize-native\\Frontend\\flask-backend\\assets\\climate_change\\fd7fa22d-023e-4fc9-a6ea-fd9a054b2d62.mp4'

# Split based on the first occurrence of 'Frontend'
split_path = full_path.split('native\\', 1)

# Get the second part and add the 'Frontend' back to it
if len(split_path) > 1:
    second_part = split_path[1]
else:
    second_part = full_path  # In case 'Frontend' is not found

# Print the result
print(second_part)