import { reportRepository } from "./report.repository";
import { ReportQueryInput, TopProductsQueryInput } from "./report.schema";

class ReportService {
  async getRevenue(query: ReportQueryInput) {
    return reportRepository.getRevenue(query.from, query.to);
  }

  async getCosts(query: ReportQueryInput) {
    return reportRepository.getCosts(query.from, query.to);
  }

  async getProfit(query: ReportQueryInput) {
    return reportRepository.getProfit(query.from, query.to);
  }

  async getOrdersStats(query: ReportQueryInput) {
    return reportRepository.getOrdersStats(query.from, query.to);
  }

  async getTopProducts(query: TopProductsQueryInput) {
    return reportRepository.getTopProducts(query.from, query.to, query.limit);
  }

  async getDailyRevenue(query: ReportQueryInput) {
    return reportRepository.getDailyRevenue(query.from, query.to);
  }
}

export const reportService = new ReportService();
