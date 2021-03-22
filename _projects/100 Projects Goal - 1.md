---
layout: project
title: 100 Project Goal - 1
description: So here I'm gonna write up all the projects that I undertake as a part of this inttiative
summary: This is a beginner level ETL project
category: Python, Beginner, ETL
---

TL;DR - I was bored and googled 100 DS projects and landed up on this [medium article](https://amankharwal.medium.com/100-machine-learning-projects-aff22b22dd6e) by Aman Kharwal. So just gonna do all the projects he did.


The first one is President Height Analysis, pretty basic liked doing it.


Let's load the data, go ahead download the file from [here](https://github.com/asoliyarohit/100-DS-project-exercise/blob/3e54408648e28c87e7342488f30e07d07dc2d841/Project%201%20-%20US%20president%20heights/president_heights.csv)


let's jump into analysing it.


```
#loading the required modules

import numpy as np
import pandas as pd


#read the data


raw_data = pd.read.csv (" /local_machine/location/name.csv")

#lets print the first five rows

print(raw_data.head())

```
output: 
![image](https://github.com/asoliyarohit/100-DS-project-exercise/blob/eea3dafc3052002de61addf501f8a20a761e3188/Project%201%20-%20US%20president%20heights/Sample%20head.JPG)

```

# lets look at all the values height column takes

height = np.array(data["height(cm)"])
print(height)

```
output: 
![image](https://github.com/asoliyarohit/100-DS-project-exercise/blob/6a66f3f5ebf54752dfb8985875133dc96774a98d/Project%201%20-%20US%20president%20heights/array_of_height.JPG)


```

#let's calculate summary stats

print("Mean of heights =", height.mean())
print("Standard Deviation of height =", height.std())
print("Minimum height =", height.min())
print("Maximum height =", height.max())
print("25th percentile =", np.percentile(height, 25))
print("Median =", np.median(height))
print("75th percentile =", np.percentile(height, 75))

```

output: 
![image](https://github.com/asoliyarohit/100-DS-project-exercise/blob/6a66f3f5ebf54752dfb8985875133dc96774a98d/Project%201%20-%20US%20president%20heights/sample_stat.JPG)


```
#or simply use this 

raw_data.describe().transpose()

```

output: 
![image](https://github.com/asoliyarohit/100-DS-project-exercise/blob/6a66f3f5ebf54752dfb8985875133dc96774a98d/Project%201%20-%20US%20president%20heights/sample_describe.JPG)


```
#let's plot some map

import matplotlib.pyplot as plt
import seaborn as sns
sns.set()

plt.hist(height)
plt.title("Height Distribution of Presidents of USA")
plt.xlabel("height(cm)")
plt.ylabel("Number")
plt.show()

```

output: 
![image](https://github.com/asoliyarohit/100-DS-project-exercise/blob/6a66f3f5ebf54752dfb8985875133dc96774a98d/Project%201%20-%20US%20president%20heights/plotted_map.JPG)


Some concluding remarks:

#####75% of the presidents have a height below the 183cm mark
#####average height is shy of 180cm


Find the jupyter notebook here: [IPYNB](https://github.com/asoliyarohit/100-DS-project-exercise/blob/6a66f3f5ebf54752dfb8985875133dc96774a98d/Project%201%20-%20US%20president%20heights/presidentHeights_exercise.ipynb)









