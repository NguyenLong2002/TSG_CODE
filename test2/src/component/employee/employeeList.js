import React, { Component } from 'react';
import EmployeeDetail from './employeeDetail';
import './employee.css';

class EmployeeList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      employees: [
        { id: 1, name: 'Nguyễn Thành Long', age: 20, address: 'Hà Nội', department: 'Nhân sự', position: 'Vị trí Nhân Viên', school: 'Đại học Thuỷ Lợi' },
        { id: 2, name: 'Nguyễn Thành Nam', age: 21, address: 'Hà Nội', department: 'IT', position: 'Vị trí Trưởng Phòng', school: 'Đại học Quốc Gia' },
        { id: 3, name: 'Nguyễn Thị Mai', age: 22, address: 'HCM', department: 'Marketing', position: 'Vị trí Nhân Viên', school: 'Đại học Điện Lực' },
        { id: 4, name: 'Đinh Quang Thao', age: 23, address: 'Đà Nẵng', department: 'Kinh doanh', position: 'Vị trí Phó Phòng', school: 'Đại học Thăng Long' },
      ],
      selectedEmployee: null,
    };
  }

  handleEmployeeClick = (employee) => {
    this.setState({ selectedEmployee: employee });
  };

  render() {
    const { employees, selectedEmployee } = this.state;

    return (
      <div>
        <h2 style={{ textAlign: 'center' }}>Danh sách nhân viên</h2>
        <div id="employees">
          <ul className="employeeList">
            {employees.map((employee) => (
              <li 
                style={{ cursor: 'pointer' }} 
                key={employee.id} 
                onClick={() => this.handleEmployeeClick(employee)}
              >
                {employee.name}
              </li>
            ))}
          </ul>
          <div className="employDetail">
            {selectedEmployee && <EmployeeDetail employee={selectedEmployee} />}
          </div>
        </div>
      </div>
    );
  }
}

export default EmployeeList;
