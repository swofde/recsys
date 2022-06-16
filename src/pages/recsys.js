import * as React from "react"
import { Link } from "gatsby"
import DropdownList from "react-widgets/DropdownList";

import Layout from "../components/layout"
import Seo from "../components/seo"
import "react-widgets/styles.css";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import 'bootstrap/dist/css/bootstrap.min.css';

// import Button from "react-widget-button";
// import "react-widget-button/style";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

var chartReference = React.createRef()
var selectedValue = 1
var datas = {
    labels:['Случайный ','Сингулярное разложение (SVD++)' ,'Базовая модель Pragmatic Chaos' ,'Косинусное расстояние' ,'Корреляция Пирсона' ], 
    datasets: [{
        label: 'MAE (Абсолютная ошибка)',
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1
    },
    {
      label: 'RMSE (Корень среднего квадратов ошибки)',
      data: [0, 0, 0, 0, 0],
      backgroundColor: [
          'rgba(54, 162, 235, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(54, 162, 235, 0.2)',
      ],
      borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(54, 162, 235, 1)',
      ],
      borderWidth: 1
  }]
};

function onSelectedChange(val){
  selectedValue = val
}

function onFileChange() {
  const selectedFile = document.getElementById('input').files[0];
}

function downloadObjectAsJson(exportObj, exportName){
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function onFileUploadMethods() {
  var chr = chartReference
  var curcsv = ""
  const selectedFile = document.getElementById('input').files[0];
  if (selectedFile == null){
      alert('Выберите файл!')
  }
  else{
      if (selectedFile.name.toLowerCase().lastIndexOf(".csv") == -1){
          alert("Поддерживаются файлы только с форматом *.csv");
          return
      }
      let reader = new FileReader();
      let bytes = 1024*1024*3;
      reader.onloadend = function (evt) {
          let lines = evt.target.result;
          curcsv = CSVToArray(lines);
          let uids = [];
          let iids = [];
          let ratings = [];
          alert("Ожидайте... Это займет несколько секунд.");
          for (let i = 1; i < curcsv.length; i++){
              uids.push(parseInt(curcsv[i][0]))
              iids.push(parseInt(curcsv[i][1]))
              ratings.push(parseFloat(curcsv[i][2]))
          }
          const table = {
              user_id : uids,
              item_id : iids,
              rating : ratings
          };
          const query_body = {
              purpose : 'eval',
              table : table
          };
          // const table = {
          //     "user_id" : [1,2,3],
          //     "item_id" : [1,2,3],
          //     "rating" : [1,2,3]
          // };
          var res = JSON.stringify(query_body)
          console.log(query_body)
          // var stripped = res.replace('"', "");
          const response = fetch('https://functions.yandexcloud.net/ваша_яндекс_функция', {
            method: 'POST',
            httpMethod: 'POST',
            headers:{
              "Content-Type": "text/plain"
            },
            body: res,
            requestContext:{
              httpMethod:'POST'
            }
            })
            .then(response => response.json())
            .then(data => {
              alert('Готово!')
              console.log('Success');
              
              console.log(chr)

              
              chr.current.data.datasets[0].data = [data['random']['MAE'], data['SVD']['MAE'], data['baseline']['MAE'], data['cosine']['MAE'], data['pearson']['MAE']]
              chr.current.data.datasets[1].data = [data['random']['RMSE'], data['SVD']['RMSE'], data['baseline']['RMSE'], data['cosine']['RMSE'], data['pearson']['RMSE']]

              chr.current.update();
            })
            .catch((error) => {
              console.error('Error:', error);
              alert('Что-то пошло не так...')
            });
                    
      }
      let blob = selectedFile.slice(0, bytes);
      reader.readAsBinaryString(blob);
  }
}
function onFileUpload() {
    var selVal = selectedValue
    var curcsv = ""
    const selectedFile = document.getElementById('input').files[0];
    if (selectedFile == null){
        alert('Выберите файл!')
    }
    else{
        if (selectedFile.name.toLowerCase().lastIndexOf(".csv") == -1){
            alert("Поддерживаются файлы только с форматом *.csv");
            return
        }
        let reader = new FileReader();
        let bytes = 1024*1024*3;
        reader.onloadend = function (evt) {
            let lines = evt.target.result;
            curcsv = CSVToArray(lines);
            let uids = [];
            let iids = [];
            let ratings = [];
            alert("Ожидайте... Это займет несколько секунд.");
            for (let i = 1; i < curcsv.length; i++){
                uids.push(parseInt(curcsv[i][0]))
                iids.push(parseInt(curcsv[i][1]))
                ratings.push(parseFloat(curcsv[i][2]))
            }
            const table = {
                user_id : uids,
                item_id : iids,
                rating : ratings
            };
            const query_body = {
              purpose : 'train',
              selectedMethod : selVal,
              table : table
          };
            // const table = {
            //     "user_id" : [1,2,3],
            //     "item_id" : [1,2,3],
            //     "rating" : [1,2,3]
            // };
            var res = JSON.stringify(query_body)
            console.log(query_body)
            // var stripped = res.replace('"', "");
            const response = fetch('https://functions.yandexcloud.net/ваша_яндекс_функция', {
              method: 'POST',
              httpMethod: 'POST',
              headers:{
                "Content-Type": "text/plain"
              },
              body: res,
              requestContext:{
                httpMethod:'POST'
              }
              })
              .then(response => response.json())
              .then(data => {
                alert('Готово! Сейчас начнется загрузка ваших рекомендаций!')
                console.log('Success');
                downloadObjectAsJson(data, 'ratings-sorted')
              })
              .catch((error) => {
                console.error('Error:', error);
                alert('Что-то пошло не так...')
              });
                      
        }
        let blob = selectedFile.slice(0, bytes);
        reader.readAsBinaryString(blob);
    }
}

function CSVToArray(strData, strDelimiter) {
    strDelimiter = (strDelimiter || ",");
    let objPattern = new RegExp(
      (
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
      "gi"
      );
    let arrData = [[]];
    let arrMatches = null;
    while (arrMatches = objPattern.exec(strData)) {
      let strMatchedDelimiter = arrMatches[1];
      let strMatchedValue = [];
      if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
        arrData.push([]);
      }
      if (arrMatches[2]) {
        strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"),"\"");
      } else {
        strMatchedValue = arrMatches[3];
      }
      arrData[arrData.length - 1].push(strMatchedValue);
    }
    return (arrData);
  }

function readImage(file) {
    // Check if the file is an image.
    
  }

const RecSys = () => (
  <Layout>
    <Seo title="Составление рекомендаций" />
    <h1>Составление рекомендаций</h1>
    <p>Загрузите свои рейтинги кликнув на кнопку <b>"Выберите Файл"</b></p>
    <div>
      <Form.Control type="file" onChange={onFileChange} id="input"/>
        <div id='filename'>
        </div>
        <p></p>
        <Button variant="outline-primary" onClick={onFileUploadMethods}>Получить метрики</Button>
        <div id='download-button'>
        </div>
    </div>
    <Bar data={datas} ref={chartReference}/>
    <div>
    <p>Выберите метод для построения рекомендаций</p>
    <DropdownList
      dataKey="id"
      onChange={(nextValue) => onSelectedChange(nextValue.id)}
      textField="value"
      data={[
        { id: 1, value: 'Случайный'},
        { id: 2, value: 'Сингулярное разложение (SVD++)' },
        { id: 5, value: 'Базовая модель Pragmatic Chaos' },
        { id: 3, value: 'Косинусное расстояние' },
        { id: 4, value: 'Корреляция Пирсона' },
      ]}
      id="dropdown-list"/>
    <p></p>
    <Button variant="outline-primary" onClick={onFileUpload}>Получить рекомендации</Button>
    </div>
    <Link to="/">На главную</Link>
  </Layout>
)

export default RecSys


