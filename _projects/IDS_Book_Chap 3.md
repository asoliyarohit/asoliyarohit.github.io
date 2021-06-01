---
layout: project
title: Book Chap 3 Descriptive DS 
description: So here I'm gonna write up all that I learn from the book
summary: Chapter 3 of the book
category:  Python, Beginner, Descriptive Statistics
---

TL;DR - Summarizing the book Intro to DS chapter 3


Things I learnt:

### Descriptive Stats: 
Descriptive statistics is all about the concepts, terms, measures and tools that help to describe, show and summarize the data in a meaningful way


### Main Principles:
- A *population* is a collection of objects, items (“units”) about which information is sought.
- A *sample* is a subset of that target population


#### The Adult income data set:
*Problem Statement:* Are the men more likely to become high income professionals i.e. to receive income bigger than 50K?

We need to perform some data analysis into this to find any merit in the argument. It could be false for a variety of reasons, including but not limited to:

- There are a small number of samples (personal experience, friends, etc.).
- There is a selection bias: most believers are interested in this claim because their first babies were late.
- There is a confirmation bias: believers might be more likely to contribute data that confirm it.
- Sources are innaccurate: personal stories are subject to memory deformations.

#### Part 1.1 Getting Data:
Got the data from here: https://archive.ics.uci.edu/ml/machine-learning-databases/adult/adult.data

#### Part 1.2 Data Prep:
Used the ardous method of extracting it from '.data' file, but I guess there must be away to read it more easily in pandas. loaded the data into a file, then defined a char to int function and passed it to file. Then converted into a pandas df.

#### Part 1.3 Data Structure:
Once converted into pandas df, our data is ready for analysis. Looking at the shape we get 

```python
df.shape
```
(32561,15)

##### Note: I won't be writing all the python code here, please refer to the notebook attached.

then looked at the group by country and age. Further seperated the data set into male and female and high income groups.

#### Part 1.4 Data Cleaning:
There are certain easy aspects of data cleaning that have been highlighted:
- *Sample the data:* If the amount of raw data is huge, processing all of them may require an extensive amount of processing power which may not be practical. Sample and reduce the size

- *Impute missing data:* It is quite common that some of the input records are incomplete in the sense that certain fields are missing or have input error. In a typical tabular data format, we need to validate each record contains the same number of fields and each field contains the data type we expect. In case the record has some fields missing, we have the following choices:

(a) Discard the whole record if it is incomplete;
(b) Infer the missing value based on the data from other records. A common approach is to fill the missing data with the average, or the median.

- *Normalize numeric value:* Normalize data is about transforming numeric data into a uniform range.

- *Reduce dimensionality:* High dimensionality can be a problem for some machine learning methods. There are two ways to reduce the number of input features. One is about _removing irrelevant_ input variables, another one is about _removing redundant_ input variables.

- *Add derived features:* In some cases, we may need to compute additional attributes from existing attributes (f.e. converting a geo-location to a zip code, or converting the age to an age group).

- *Discretize numeric value into categories:*  Discretize data is about cutting a continuous value into ranges and assigning the numeric with the corresponding bucket of the range it falls on. Binningggggggggggggg!

- *Binarize categorical attributes:* Certain machine learning models only take binary input (or numeric input). In this case, we need to convert categorical attribute into multiple binary attributes, while each binary attribute corresponds to a particular value of the category.

- *Select, combine, aggregate data:* Designing the form of training data is the most important part of the whole predictive modeling exercise because the accuracy largely depends on whether the input features are structured in an appropriate form that provide strong signals to the learning algorithm. Rather than using the raw data as it is, it is quite common that multiple pieces of raw data need to be combined together, or aggregating multiple raw data records along some dimensions.


### EDA

#### 2.1.1 Summarising Data : Mean

sample mean is the sum of the values divided by the number of values:

$$ \mu = \frac{1}{n} \sum_i x_i $$

It describes the central tendency of a sample. Easily affected by outliers as visible.

#### 2.1.2 Summarising Data : Variance

variance:

$$ \sigma^2 = \frac{1}{n} \sum_i (x_i - \mu)^2 $$

Variance $\sigma^2$ describes the spread of data. The term $(x_i - \mu)$ is called the deviation from the mean, so variance is the mean squared deviation.

The square root of variance, $\sigma$, is called the standard deviation. We define standard deviation because variance is hard to interpret (explainably)

#### 2.1.3 Summarising Data : Median
Median implies the middle value. Unaffected by outliers like a boss.


#### 2.2 Data Distribution : Histograms

most common representation of a distribution is a histogram. more like a frequency plot.

Oh wait why data distribution? Basically all this numbers can sometimes be misleading like a bad ex, its important to understand the entire scenario much better by looking at the distributions.

We can calculate the *Probability Mass Function (PMF)* by divding the frequency of the histograms by number of samples.

We can also calculate the *Cumulative Distribution Function (CDF)*, or just *distribution function*, that describes the probability that a real-valued random variable X with a given probability distribution will be found to have a value less than or equal to X.


This is all that I completed as of 1st June, will update the rest tomorrow.


Danke!