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

```python
raw_data = pd.read_csv ('/location.csv'), na_values = ';' , usecols = ['col1','col2','col3']

edu
```
na_values specifies the character that represents "non available data" in the file. usecols is obvious,what columns we wanna use.


#### Viewing data:
```python
raw_data.head()
raw_data.tail()
raw_data.columns
raw_data.index 
raw_data.values #dataframe is retrieved as python array
raw_data.describe()
```

#### Selection:

```python
#select the columns
raw_data['col1']
#select the rows
raw_data[10:16]

```

#### Filtering

```python
#all you have to do is what boolean index should it pick up

raw_data['col1'] >= 10  # this will specify(mask) every value in series col1 as true and false

raw_data[raw_data['col1'] >= 10] # this will filter it for all the mask true

#missing values

raw_data[raw_data['col1'].isnull()]
```

#### Manipulation

Pandas has a bunch of inbuilt functions that can be used

```python

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

```python
s = raw_data['col1'].apply(lambda d: d**2)
s.head() #gives square of each value in the col1

```

#### Drop & Append & Sort

```python
append({dictionary of new row},ignore_index=True) #set the ignore_index flag in the append method to True, otherwise the index 0 is given to this new row, what will produce an error if it already exists

drop()

sort_values(by = 'col1',ascending = True, inplace= True)

```

#### Group By

```python
group = raw_data[['Col1', 'Value']].groupby('col1').mean()

```

#### Pivot Table
```python
pivoted_data = pd.pivot_table(raw_data, values='Value',
                        index=['Col1'], columns=['col2'])

```


These are all thats there. Plotting basics was there but I think that is more of a pick as you go thing.
no need to remember them.


Danke!





