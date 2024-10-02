import React, { Component } from 'react';

class EmployeeDetail2 extends Component {

  constructor(props){
    super(props)
    this.state = {
      school : ''
    }
  }
  componentDidMount() {
    const { employee } = this.props;
    this.setSchool(employee);
  }

  setSchool(employee){
      this.setState ({
        school : `${employee.school} (abc)`
      });
    }


  componentDidUpdate(prevProps) {
    if (prevProps.employee !== this.props.employee) {
      this.setSchool(this.props.employee);
    }
  }


  render() {
    const {school} = this.state;

    return (
      <div>
        <h2>Thông tin trường học</h2>
        <p>Trường: {school}</p>
      </div>
    );
  }
}

export default EmployeeDetail2;
