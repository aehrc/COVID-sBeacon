import { Injectable } from '@angular/core';


@Injectable()
export class DownloadService {

    downloadFile(data, filename='accesionIDs') {
        //let csvData = this.ConvertToCSV(data, ['accessionIDs']);
        let csvData = 'accesionIDs' + "\n";
        for (let i =0; i<data.length; i++){
          csvData += data[i] + "\n";
        }
        //console.log(csvData)
        let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
        let dwldLink = document.createElement("a");
        let url = URL.createObjectURL(blob);
        let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
        if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
            dwldLink.setAttribute("target", "_blank");
        }
        dwldLink.setAttribute("href", url);
        dwldLink.setAttribute("download", filename + ".csv");
        dwldLink.style.visibility = "hidden";
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
    }

}
