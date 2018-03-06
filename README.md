# project-pipeline-display
Project for the Contra Costa Civic Hackathon. A webpage that automatically updates based on changes made to a Google sheet.

The Google sheet used for this example can be found here: https://docs.google.com/spreadsheets/d/1rLEvYFj8yigM6sn9IEaA28oqJoLhcla-urqGaM1Q_B0


The page generates based on the state of the sheet when it is loaded, so any changes to the sheet show up immediately.

If you plan to change the format of the sheet, make sure you adjust URL, queryString and dataColumns variables in the html accordingly.

If you want to add more information to the table, adjust the tableColumn variable.
