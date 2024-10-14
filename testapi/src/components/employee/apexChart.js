import { Component } from 'react';
import { config } from "../../environment";
import { sp } from "@pnp/sp";
import "@pnp/sp/site-users/web";
import "@pnp/sp/profiles";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import Chart from "react-apexcharts";

export default class ApexChart extends Component {
  constructor(props) {
    super(props);
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    this.state = {
      listEmployees: [],
      maleCount: 0,
      femaleCount: 0,
      departmentCounts: {},
      seriesGender: [],  
      seriesDepartment: [],
      optionsGender: {
        chart: {
          width: 380,
          type: 'pie',
        },
        labels: ['Nam', 'Nữ'],
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      },
      optionsDepartment: {
        chart: {
          width: 380,
          type: 'pie',
        },
        labels: [],
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      },
    };
  }

  async componentDidMount() {
    await this.loadEmployees();
  }

  loadEmployees = async () => {
    try {
      const listEmployees = await sp.web.lists
        .getByTitle("ListEmployees")
        .items
        .select("Id", "name", "sex", "department")
        .get();

      // Gender counts
      const maleCount = listEmployees.filter(emp => emp.sex === "male").length;
      const femaleCount = listEmployees.filter(emp => emp.sex === "female").length;

      // Department counts
      const departmentCounts = listEmployees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      }, {});
      console.log(departmentCounts);

      const departmentLabels = Object.keys(departmentCounts);
      const departmentSeries = Object.values(departmentCounts);

      this.setState({
        listEmployees,
        maleCount,
        femaleCount,
        seriesGender: [maleCount, femaleCount],
        seriesDepartment: departmentSeries,
        optionsDepartment: {
          ...this.state.optionsDepartment,
          labels: departmentLabels,
        },
      });
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  render() {
    const { seriesGender, seriesDepartment, optionsGender, optionsDepartment } = this.state;

    if (seriesGender.length === 0 || seriesDepartment.length === 0) {
      return <div>Loading chart data...</div>;
    }

    return (
      <div className="d-flex px-4">
        <div>
            <h3>Thống kê nam/nữ</h3>
            <Chart options={optionsGender} series={seriesGender} type="pie" width={350} />
        </div>
        <div className="ms-4">
            <h3>Thống kê bộ phận</h3>
            <Chart options={optionsDepartment} series={seriesDepartment} type="pie" width={380} />
        </div>
      </div>
    );
  }
}
