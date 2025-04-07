import json
import csv

# Load JSON data from search.json
with open('search.json', 'r') as json_file:
    data = json.load(json_file)

# Check if the data is non-empty and extract header keys
if data:
    header = data[0].keys()

    # Write the CSV file to output.csv
    with open('output.csv', 'w', newline='') as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=header)
        writer.writeheader()
        for entry in data:
            writer.writerow(entry)
else:
    print("The JSON file is empty.")
