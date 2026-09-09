# Delivery — specification only

Future double-clickable Windows executable opens a browser wizard, with official platform export links, precise export options and ZIP drag/drop. Verify export instructions when implementation starts. No terminal required for end users. Proposed destination: Documents/Hindsight/hindsight-YYYY-MM-DD.html, with collision-safe handling and automatic opening. Developer test scripts are separate from this eventual interface.

Wizard processes files locally; any future loopback server must validate host/origin, bind only to loopback and serve no data externally. Guide users through missing/malformed exports and disclosure labels. Quarantine working copies before parsing; never move or modify original files. No executable, ZIP support, wizard or server implemented now.
