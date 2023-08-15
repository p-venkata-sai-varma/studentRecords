import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

function ExcelSheetReader({state}) {
  const [file, setFile] = useState(null);
  const [studentFile, setStudentFile] = useState(null);
  const [data, setData] = useState([]);
  const [imageHashes, setImageHashes] = useState([]);
  const {contract}=state;
  const [imageStatus, setImageStatus] = useState([])
  const [mintingStatus, setMintingStatus] = useState([])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = event.target.result;
      const workbook = XLSX.read(fileData, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      setData(sheetData.slice(1)); 
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleUploadToIPFS = async (e, rowIndex) => {
    e.preventDefault();
    const newImagesStatus = [...imageStatus];
    newImagesStatus[rowIndex] = 'Uploading...'
    setImageStatus(newImagesStatus)

    if (e.target.files[0]) {
      try {
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
  
        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            'Accept': 'text/plain',
            'pinata_api_key': `${import.meta.env.VITE_PINATA_API_KEY}`,
            'pinata_secret_api_key': `${import.meta.env.VITE_PINATA_API_SECRET}`,
            "Content-Type": "multipart/form-data"
          },
        });
  
        const newImageHashes = [...imageHashes];
        newImageHashes[rowIndex] = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        setImageHashes(newImageHashes);
      } catch (error) {
        console.log("Error sending file to IPFS");
        console.log(error);
      }
    }
  };
  

  const handleMintClick = async (rowIndex, rowData) => {
    try {
      setMintingStatus(prevStatuses => {
        const newMintingStatus = [...prevStatuses];
        newMintingStatus[rowIndex] = 'Minting...';
        return newMintingStatus;
      });

      const studentStruct = {
        StudentFirstName: rowData[1], 
        StudentLastName: rowData[2], 
        Gender: rowData[3], 
        ClassGrade: rowData[4].toString(), 
        StudentId: rowData[5] 
      }

      console.log(studentStruct.toString())

      const parentStruct = {
        ParentName: rowData[6], 
        MotherName: rowData[7] 
      };

      const imageHash = imageHashes[rowIndex];
      const to = rowData[0];

      const transaction = await contract.mint(to, studentStruct, parentStruct, imageHash)
      await transaction.wait();

      setMintingStatus(prevStatuses => {
        const newMintingStatus = [...prevStatuses];
        newMintingStatus[rowIndex] = 'Minted 🔶';
        return newMintingStatus;
      });
    } catch {
      setMintingStatus(prevStatuses => {
        const newMintingStatus = [...prevStatuses];
        newMintingStatus[rowIndex] = null;
        return newMintingStatus;
      });
    }
  };

  return (
    <div className="excel-sheet-reader">
      <h2>Upload Details</h2>
      <div className="file-input-wrapper">
        <span>Choose Excel File</span>
        <input
          type="file"
          accept=".xlsx,.xls"
          className="file-input"
          onChange={handleFileChange}
        />
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>To</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Gender</th>
            <th>Class Grade</th>
            <th>Student ID</th>
            <th>Parent Name</th>
            <th>Mother Name</th>
            <th>URL of Image</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>
                  {cell}
                </td>
              ))}
              <td>
                {imageHashes[rowIndex] && imageStatus ? (
                  imageHashes[rowIndex]
                ) : imageStatus[rowIndex] ? ("Uploading...") : (
                  <>
                    <input
                      id={`imageInput-${rowIndex}`} // Use unique ID for each row
                      type="file"
                      accept="image/*"
                      className="hidden-input"
                      onChange={(e) => handleUploadToIPFS(e, rowIndex)} // Pass the rowIndex
                    />
                    <label htmlFor={`imageInput-${rowIndex}`} className="custom-file-upload">
                      Upload Image
                    </label>
                  </>
                )}
              </td>
              <td>
              {mintingStatus[rowIndex] === 'Minting...' ? (
                'Minting...'
              ) : mintingStatus[rowIndex] === "Minted 🔶" ? (
                'Minted 🔶'
              ) : (
                <button className="upload" onClick={() => handleMintClick(rowIndex, row)}>Mint</button>
              )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExcelSheetReader;
