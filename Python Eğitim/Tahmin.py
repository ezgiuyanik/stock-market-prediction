import numpy as np
import pandas as pd
import mysql.connector
import pandas
from keras.models import Sequential
from keras.layers import Dense, LSTM
from sklearn.preprocessing import MinMaxScaler
#from sklearn.cross_validation import train_test_split
from sklearn.metrics import mean_squared_error,r2_score
from sklearn.metrics import mean_absolute_error

# MySQL veritabanı bağlantısı
db_connection = mysql.connector.connect(
  host='localhost',
  user='root',
  password='',
  database='bitirme_data')
# Verileri çekmek için SQL sorgusu
sql_query = 'SELECT Tarih, Açılış,Kapanış FROM tbl_akbnk '

# Verileri DataFrame'e yükle
veriler = pd.read_sql(sql_query, db_connection)

# Tarih sütununu indeks olarak ayarla
veriler = veriler.set_index('Tarih')

# Verileri ölçeklendir
scaler = MinMaxScaler(feature_range=(0, 1))

X_train= veriler["Açılış"].to_numpy()
y_train= veriler["Kapanış"].to_numpy()

#verileri 5 silme
for i in range (5):
    X_train=np.delete(X_train,-1,0)
    y_train=np.delete(y_train,0,0)
print (X_train.shape[0])
X_train1=pd.DataFrame(X_train,columns=['Açılış'])
y_train1=pd.DataFrame(y_train,columns=['Kapanış'])

npx_test = 'SELECT Açılış FROM tbl_akbnk ORDER BY Tarih DESC LIMIT 30'
X_test = pd.read_sql(npx_test, db_connection)
npy_test= 'SELECT Kapanış FROM tbl_akbnk ORDER BY Tarih DESC LIMIT 30'
y_test = pd.read_sql(npy_test, db_connection)


# LSTM modeli oluştur
model = Sequential()
model.add(LSTM(units=128, return_sequences=True, input_shape=(7, 1)))
model.add(LSTM(units=64))
model.add(Dense(64, activation='relu'))
model.add(Dense(32, activation='relu'))
model.add(Dense(16, activation='relu'))
model.add(Dense(1))
model.compile(loss='mean_squared_error', optimizer='adam', run_eagerly=True,metrics='accuracy' )

# LSTM modelini eğit
#model.fit(X_train, y_train, epochs=10, batch_size=1 , validation_data=(X_test, y_test))
model.fit(X_train1, y_train1, epochs=1, batch_size=1 , validation_data=(X_test, y_test))

# Test setinde tahmin yap
test_predict = model.predict(X_test)


'''for i in range(len(test_predict)):
    print('Tahmin: {:.2f}'.format(test_predict[i][0]))
'''
for i in range(30):

    print('{}. Gün Tahmini: {:.2f}'.format(i+1, test_predict[i][0]))
   
  
# Tahminleri ve gerçek değerleri karşılaştır

rmse = mean_squared_error(y_test, test_predict, squared=False)
r2=r2_score(y_test, test_predict)
mae = mean_absolute_error(y_test, test_predict)
mse = mean_squared_error(y_test, test_predict)

print('RMSE score: %.2f RMSE' % (rmse))
print('R2 score: %.2f R2' % (r2))
print('MAE score: %.2f MAE' % (mae))
print('MSE score: %.2f MSE' % (mse))


# Get the current date
current_date = pd.Timestamp.now().strftime('%Y-%m-%d')

# Prepare the data to be written to the database
prediction_data = pd.DataFrame(test_predict, columns=['Tahmin'])
prediction_data['Tarih'] = current_date

# Write the data to the database table
cursor = db_connection.cursor()
for index, row in prediction_data.iterrows():
    cursor.execute("UPDATE tbl_akbnk SET Tahmin = %s WHERE Tarih = %s", (row['Tahmin'], row['Tarih']))
db_connection.commit()

# Close the database connection
db_connection.close()
