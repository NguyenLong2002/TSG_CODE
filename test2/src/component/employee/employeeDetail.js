import React, { Component } from 'react';
import EmployeeDetail2 from './employeeDetail2';

class EmployeeDetail extends Component {
  constructor(props) {
    console.log(1);
    super(props);
    this.state = {
      name: '',
      age: '',
      address: '',
      department: '',
      position: '',
    };
  }

  componentDidMount() {
    console.log(2);
    const { employee } = this.props;
    this.setEmployeeData(employee);
  }

  setEmployeeData(employee) {
    console.log(3);
    this.setState({
      name: `${employee.name} (NV)`,
      age: `${employee.age} (tuổi)`,
      address: `${employee.address} (city)`,
      department: `${employee.department}`,
      position: `${employee.position} - TSG`,
    });
  }
  
  componentDidUpdate(prevProps) {
    console.log(4);
    console.log(prevProps.employee);
    console.log(this.props.employee);
    if (prevProps.employee !== this.props.employee) {
      this.setEmployeeData(this.props.employee);
    }
  }

  render() {
    const { name, age, address, department, position } = this.state;
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ marginRight: 20 }}>
          <h2>Thông tin nhân viên</h2>
          <p>Tên: {name}</p>
          <p>Tuổi: {age}</p>
          <p>Địa chỉ: {address}</p>
          <p>Phòng ban: {department}</p>
          <p>Vị trí: {position}</p>
        </div>
        <div>
          <EmployeeDetail2 employee={this.props.employee} />
        </div>
      </div>
    );
  }
}

export default EmployeeDetail;
