# Machine Learning Datasets Directory

This folder holds the dataset files used for training and evaluating the phishing URL detection model.

## Primary Dataset: PhiUSIIL Phishing URL Dataset (UCI)
- Source: UCI Machine Learning Repository
- Target Classes: `0` = Legitimate, `1` = Phishing
- Note: Model training in this system relies **only** on static features that can be extracted directly from the URL string itself (without issuing external network requests or fetching live webpages).
- A dataset loader and preprocessing script will populate clean data into this directory in Stage 2.
