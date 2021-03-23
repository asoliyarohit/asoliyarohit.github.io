---
layout: project
title: Book Chap 2 Toolboxes for DS 
description: So here I'm gonna write up all that I learn from the book
summary: Chapter 2 of the book
category:  Python, Beginner, ETL
---

TL;DR - Summarizing the book Intro to DS chapter 2


First thing that I learnt:

#### Dataframe: 
A tabular data structure where columns are called series and consists of lists of several values

#### Reading a dataframe, just use pandas

```
raw_data = pd.read_csv ('/location.csv'), na_values = ';' , usecols = ['col1','col2','col3']

edu
```
na_values specifies the character that represents "non available data" in the file. usecols is obvious,what columns we wanna use.


#### Viewing data:
```
raw_data.head()
raw_data.tail()
raw_data.columns
raw_data.index 
raw_data.values #dataframe is retrieved as python array
raw_data.describe()
```

#### Selection:

```
#select the columns
raw_data['col1']
#select the rows
raw_data[10:16]

```

#### Filtering

```
#all you have to do is what boolean index should it pick up

raw_data['col1'] >= 10  # this will specify(mask) every value in series col1 as true and false

raw_data[raw_data['col1'] >= 10] # this will filter it for all the mask true

#missing values

raw_data[raw_data['col1'].isnull()]
```

#### Manipulation

Pandas has a bunch of inbuilt functions that can be used

```

count()	#Number of non-null observations
sum()	#Sum of values
mean()	#Mean of values
median()	#Arithmetic median of values
min()	#Minimum
max()	#Maximum
prod()	#Product of values
std()	#Unbiased standard deviation
var()	#Unbiased variance

```

#### Lambda (𝜆) Function

```
s = raw_data['col1'].apply(lambda d: d**2)
s.head() #gives square of each value in the col1

```

#### Drop & Append & Sort

```
append({dictionary of new row},ignore_index=True) #set the ignore_index flag in the append method to True, otherwise the index 0 is given to this new row, what will produce an error if it already exists

drop()

sort_values(by = 'col1',ascending = True, inplace= True)

```

#### Group By

```
group = raw_data[['Col1', 'Value']].groupby('col1').mean()

```

#### Pivot Table
```
pivoted_data = pd.pivot_table(raw_data, values='Value',
                        index=['Col1'], columns=['col2'])

```


These are all thats there. Plotting basics was there but I think that is more of a pick as you go thing.
no need to remember them.


Danke!





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
![image](https://github.com/asoliyarohit/100-DS-project-exercise/blob/eea3dafc3052002de61addf501f8a20a761e3188/Project%201%20-%20US%20president%20heights/Sample%20head.JPG?raw=true)

```

# lets look at all the values height column takes

height = np.array(data["height(cm)"])
print(height)

```
output: 
![image](https://github.com/asoliyarohit/100-DS-project-exercise/blob/6a66f3f5ebf54752dfb8985875133dc96774a98d/Project%201%20-%20US%20president%20heights/array_of_height.JPG?raw=true)


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
![image](https://github.com/asoliyarohit/100-DS-project-exercise/blob/6a66f3f5ebf54752dfb8985875133dc96774a98d/Project%201%20-%20US%20president%20heights/sample_stat.JPG?raw=true)


```
#or simply use this 

raw_data.describe().transpose()

```

output: 
![image](https://github.com/asoliyarohit/100-DS-project-exercise/blob/6a66f3f5ebf54752dfb8985875133dc96774a98d/Project%201%20-%20US%20president%20heights/sample_describe.JPG?raw=true)


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
![image](https://github.com/asoliyarohit/100-DS-project-exercise/blob/6a66f3f5ebf54752dfb8985875133dc96774a98d/Project%201%20-%20US%20president%20heights/plotted_map.JPG?raw=true)


Some concluding remarks:

##### 75% of the presidents have a height below the 183cm mark
##### average height is shy of 180cm


Find the jupyter notebook here: [IPYNB](https://github.com/asoliyarohit/100-DS-project-exercise/blob/6a66f3f5ebf54752dfb8985875133dc96774a98d/Project%201%20-%20US%20president%20heights/presidentHeights_exercise.ipynb)