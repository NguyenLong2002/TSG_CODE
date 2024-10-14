import { useState,useEffect } from 'react';

function EmployeeDetail2({employee}){

  const [employeeData, setEmployeeData] = useState({
    school:''
  })

  useEffect(()=>{
    if(employee){
      setEmployeeData({
        school:`${employee.school} (VIP)`
      })
    }
  },[employee])

  return(
     <div style={{ display: 'flex' }}>
        <div style={{ marginRight: 20 }}>
          <h2>Thông tin trường học</h2>
          <p>Trường: {employeeData.school}</p>
        </div>
      </div>
  )
}


export default EmployeeDetail2;
