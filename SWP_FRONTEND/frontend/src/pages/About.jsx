import React from "react";
import "../styles/About.css";

const About = () => {
  return (
    <div className="about-page">
      <div className="page-header">
        <div className="container">
          <h1>Giới Thiệu Về Hệ Thống Quản Lý Y Tế Học Đường</h1>
          <p>
            Chăm sóc sức khỏe toàn diện cho học sinh và cộng đồng trường học
          </p>
        </div>
      </div>

      <div className="container">
        <div className="about-content">
          <div className="split-title-section">
            <div className="split-title-left">
              <h2>Sứ Mệnh Của Chúng Tôi</h2>
            </div>
            <div className="split-title-right">
              <p>
                Hệ thống Quản lý Y tế Học đường được phát triển với sứ mệnh nâng
                cao chất lượng chăm sóc sức khỏe trong môi trường trường học.
                Chúng tôi hướng đến việc xây dựng một nền tảng toàn diện giúp
                kết nối giữa nhà trường, học sinh, phụ huynh và đội ngũ y tế,
                nhằm theo dõi, quản lý và chăm sóc sức khỏe một cách hiệu quả.
              </p>
              <p>
                Với phương châm "Sức khỏe là vàng", chúng tôi đặt sức khỏe và sự
                phát triển toàn diện của học sinh lên hàng đầu, đồng thời hỗ trợ
                nhà trường trong việc xây dựng môi trường học tập lành mạnh và
                an toàn.
              </p>
            </div>
          </div>

          <div className="split-title-section">
            <div className="split-title-left">
              <h2>Tính Năng Của Hệ Thống</h2>
            </div>
            <div className="split-title-right">
              <ul className="feature-list">
                <li>
                  <i className="fas fa-file-medical"></i>
                  <div>
                    <h3>Quản lý hồ sơ sức khỏe</h3>
                    <p>
                      Lưu trữ và theo dõi hồ sơ sức khỏe điện tử của từng học
                      sinh, bao gồm lịch sử bệnh tật, tiêm chủng và phát triển
                      thể chất.
                    </p>
                  </div>
                </li>
                <li>
                  <i className="fas fa-calendar-check"></i>
                  <div>
                    <h3>Lịch khám sức khỏe định kỳ</h3>
                    <p>
                      Lập kế hoạch và thông báo lịch khám sức khỏe định kỳ cho
                      học sinh, giúp nhà trường và phụ huynh dễ dàng theo dõi.
                    </p>
                  </div>
                </li>
                <li>
                  <i className="fas fa-pills"></i>
                  <div>
                    <h3>Quản lý thuốc và điều trị</h3>
                    <p>
                      Theo dõi việc sử dụng thuốc của học sinh tại trường, đảm
                      bảo tuân thủ đúng liều lượng và thời gian.
                    </p>
                  </div>
                </li>
                <li>
                  <i className="fas fa-chart-bar"></i>
                  <div>
                    <h3>Báo cáo và thống kê</h3>
                    <p>
                      Tạo báo cáo thống kê về tình hình sức khỏe học đường, giúp
                      nhà trường có cái nhìn tổng quan và đưa ra các biện pháp
                      phù hợp.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="split-title-section">
            <div className="split-title-left">
              <h2>Đội Ngũ Phát Triển</h2>
            </div>
            <div className="split-title-right">
              <p>
                Hệ thống Quản lý Y tế Học đường được phát triển bởi đội ngũ
                chuyên gia trong các lĩnh vực công nghệ thông tin, y tế và giáo
                dục. Chúng tôi hiểu rõ về nhu cầu thực tế trong môi trường
                trường học và luôn nỗ lực cải tiến hệ thống để đáp ứng tốt nhất
                những yêu cầu ngày càng cao của công tác chăm sóc sức khỏe học
                đường.
              </p>
              <div className="team-members">
                <div className="team-member">
                  <div className="member-image">
                    <img src="/images/team-member1.jpg" alt="Thành viên 1" />
                  </div>
                  <h3>Nguyễn Văn A</h3>
                  <p>Giám đốc dự án</p>
                </div>
                <div className="team-member">
                  <div className="member-image">
                    <img src="/images/team-member2.jpg" alt="Thành viên 2" />
                  </div>
                  <h3>Trần Thị B</h3>
                  <p>Chuyên gia y tế</p>
                </div>
                <div className="team-member">
                  <div className="member-image">
                    <img src="/images/team-member3.jpg" alt="Thành viên 3" />
                  </div>
                  <h3>Lê Văn C</h3>
                  <p>Kỹ sư phần mềm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
