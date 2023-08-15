import React, { useState, useEffect } from 'react';

function StudentDetails({ state }) {
    const [studentDetails, setStudentDetails] = useState([]);
    const { contract } = state;

    useEffect(() => {
      async function fetchStudentDetails() {
        if (contract) { 
          try {
            const totalStudents = await contract.Student_ID(); // Assuming your contract has a totalSupply function

            const fetchedStudentDetails = [];
            for (let i = 3; i < totalStudents - 1; i++) {
              const studentId = i + 1; // Assuming student IDs are 1-indexed
              const student = await contract.studentInfo(studentId);
              console.log(student)
              const parent = await contract.parentInfo(studentId);
              const image = await contract.tokenURI(studentId);
              console.log(studentId, image)
              fetchedStudentDetails.push({
                  studentId: studentId,
                  student: student,
                  parent: parent,
                  image: image
              });
            }
            
            setStudentDetails(fetchedStudentDetails);
          } catch (error) {
              console.error("Error fetching student details:", error);
          }
        }
      }

      fetchStudentDetails();
    }, [contract]);

    return (
      <div>
        <h2>Student Details</h2>
        <table className='data-table'>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Gender</th>
              <th>Class Grade</th>
              <th>Parent Name</th>
              <th>Mother Name</th>
              <th>Photo</th>
            </tr>
          </thead>
          <tbody>
            {studentDetails.map((details) => (
              <tr key={details.studentId}>
                <td>{details.studentId}</td>
                <td>{details.student.StudentFirstName}</td>
                <td>{details.student.StudentLastName}</td>
                <td>{details.student.Gender}</td>
                <td>{details.student.ClassGrade}</td>
                <td>{details.parent.ParentName}</td>
                <td>{details.parent.MotherName}</td>
                <td>
                {!details.image ? ("No Image") : (
                  <img
                    src={details.image}
                    alt={`Image ${details.studentId}`}
                    width="50"
                    height="50"
                  />
                )}
            </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
}

export default StudentDetails;