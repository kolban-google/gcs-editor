# GCS Editor
This project is the source of a web app that allows us to view and edit Google Cloud Storage
files.  First, we sign-in to provide access to GCS.  Next, we select the bucket we wish
to look for files.  Finally, we select the files we wish to edit, view their content and
optionally write any changes back.

GCS is immutable blob storage which means that when we save changes, we are writing back
the whole file replacing what was previously present.

This project is as-is and not a Google product or offering.  It is open source and there
is no formal support.