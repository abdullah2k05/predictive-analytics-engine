import pandas as pd
import numpy as np
import matplotlib as pt 
import joblib as jb
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

data = pd.read_csv('data/dataSet.csv')

#print(data.head())

# print(data.shape) #-------------------(1200,25)-------------------

# print(data.info())  # ---------------

#print(data.isnull().sum()) # --------------DATA IS CLEANED-----------------

#print(data.duplicated().sum()) # --------------NO DUPLICATE DATA-----------------
#print(data.dtypes)

x = data.drop('churn',axis=1)
y = data['churn']

X = pd.get_dummies(x,drop_first=True) 

X_train , X_test ,Y_train , Y_test = train_test_split(X,y,test_size=0.2,random_state=42)

# print(X_train.shape)
# print(X_test.shape)

# print(X_test.head())

model = RandomForestClassifier()
model.fit(X_train,Y_train)

#--------------------WE WILL SEPERATE ALL THE IMPORTANT FEATURES-----------------
importance = pd.Series(model.feature_importances_, index=X_train.columns)

importance.sort_values(ascending=False)

#print(importance)


top_features = importance.nlargest(10).index

X_train_final = X_train[top_features]
X_test_final = X_test[top_features]

final_model = RandomForestClassifier()

final_model.fit(X_train_final,Y_train)

y_pred = final_model.predict(X_test_final)

accuracy = final_model.score(X_test_final,Y_test)


print('Accuracy:', accuracy)
print('Top 10 Features:', top_features)
print('before feature selection:' , model.score(X_test,Y_test))
print('after feature selection:' , accuracy)


jb.dump(final_model,'churn_model.pkl')