import os
from pathlib import Path
from Database import db_functions

path = Path(__file__).parent.parent
video_save_path = os.path.join(path, 'Frontend\\flask-backend\\assets\\climate_change\\ce7afba9-3791-498c-ae89-7')
ab= video_save_path.split('native\\',1)[1]
print(ab)

# x="Frontend/flask-backend/assets/climate_change/ce7afba9-3791-498c-ae89-7"
# x=x.replace("/","\\")
# print(x)


db_functions.insert_video_details(ab,'','')