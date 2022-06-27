GCS_BUCKET=kolban-test

all:
	@echo "clean"

make-test-files:
	gsutil cp Makefile gs://$(GCS_BUCKET)/test-root/file1.txt
	gsutil cp Makefile gs://$(GCS_BUCKET)/test-root/a/file2.txt
	gsutil cp Makefile gs://$(GCS_BUCKET)/test-root/a/file3.txt
	gsutil cp Makefile gs://$(GCS_BUCKET)/test-root/a/b/file4.txt
	gsutil cp Makefile gs://$(GCS_BUCKET)/test-root/c/file5.txt

clean:
	rm -rf node_modules
	rm -rf package-lock.json
	rm -rf build

deploy:
	-gsutil mb -l us-central1 gs://kolban-gcs-editor
	#gsutil rm -r gs://kolban-gcs-editor
	gsutil cp -r build/* gs://kolban-gcs-editor/gcs-editor

buildx:
	PUBLIC_URL="."; npm run build

saveToGit:
	git add .
	git commit -m "$(shell date)"
	git push
	npm run deploy