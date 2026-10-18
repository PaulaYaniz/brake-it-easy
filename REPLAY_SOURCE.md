# Recorded demo cases

The four bundled cases are derived from `1_20210317_184512.csv` and `2_20210317_171452.csv` in Shardul Nazirkar, *Phone sensor data while driving a car and normal or aggressive driving behaviour classification*, Mendeley Data V1 (2021), [DOI: 10.17632/5stn873wft.1](https://doi.org/10.17632/5stn873wft.1), licensed CC BY 4.0.

The originals contain 6,646 and 7,603 phone readings from two March 17, 2021 trips. `scripts/import_replay.py` aggregates them to one-second samples and splits each trip at its midpoint. Cases 1–2 come from the first file; cases 3–4 come from the second. They are nonoverlapping excerpts, **not four independent journeys**. Pressing Start drive cycles through the four excerpts and saves each review locally.

Each second retains median speed and cumulative distance plus maximum three-axis motion magnitude. Distance is rebased to zero at the beginning of each excerpt, with tiny backwards jitter removed. The chart and review moments use recorded values, not a synthetic driving trace. Coordinates, heading, gyro values, and contributor behavior labels are omitted. The source describes fields but not units; the replay treats speed as metres per second and distance as metres. Fuel estimates use a separate, editable demonstration vehicle assumption and do not describe the vehicle in the dataset.
