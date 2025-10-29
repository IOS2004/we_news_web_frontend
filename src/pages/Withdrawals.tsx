import { useState, useEffect } from "react";
import { Wallet, DollarSign, Clock, CheckCircle, XCircle, Info, CreditCard, Building, User } from "lucide-react";
import toast from "react-hot-toast";
import { withdrawalService } from "@/services/withdrawalService";
import type { WithdrawalRequest } from "@/types";
import { useWallet } from "@/contexts/WalletContext";

export default function Withdrawals() {
  const [activeTab, setActiveTab] = useState<"request" | "history">("request");
  const [amount, setAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "failed" | "approved" | "rejected">("all");
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Use wallet context to get real balance
  const { wallet, refreshWallet } = useWallet();
  const availableBalance = wallet?.balance || 0;
  const minimumWithdrawal = 500;

  // Fetch wallet balance on component mount
  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  // Fetch withdrawal history
  useEffect(() => {
    if (activeTab === "history") {
      fetchWithdrawalHistory();
    }
  }, [activeTab, filterStatus]);

  const fetchWithdrawalHistory = async () => {
    setHistoryLoading(true);
    try {
      const statusFilter = filterStatus === "all" ? undefined : filterStatus;
      const response = await withdrawalService.getMyWithdrawals(1, 50, statusFilter);
      
      if (response.success && response.data) {
        setWithdrawalHistory(response.data);
      } else {
        toast.error(response.message || "Failed to load withdrawal history");
      }
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      toast.error("Failed to load withdrawal history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleWithdrawalRequest = async () => {
    const withdrawalAmount = parseFloat(amount);

    if (!amount || !bankAccount || !ifscCode || !accountHolderName) {
      toast.error("Please fill all required fields");
      return;
    }

    if (withdrawalAmount < minimumWithdrawal) {
      toast.error(`Minimum withdrawal amount is ₹${minimumWithdrawal}`);
      return;
    }

    if (withdrawalAmount > availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      const response = await withdrawalService.requestWithdrawal({
        amount: withdrawalAmount,
        bankAccountNumber: bankAccount,
        ifscCode,
        accountHolderName
      });

      if (response.success) {
        toast.success("Withdrawal request submitted successfully!");
        setAmount("");
        setBankAccount("");
        setIfscCode("");
        setAccountHolderName("");
        // Refresh wallet to get updated balance
        await refreshWallet();
        setActiveTab("history");
      } else {
        toast.error(response.message || "Failed to submit withdrawal request");
      }
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      toast.error("Failed to submit withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-100";
      case "approved": return "text-blue-600 bg-blue-100";
      case "pending": return "text-yellow-600 bg-yellow-100";
      case "rejected":
      case "failed": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "approved": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "rejected":
      case "failed": return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Withdrawals</h1>
        <p className="text-gray-600 mt-1">Manage your withdrawal requests and view history</p>
      </div>

      <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm">
        <button
          onClick={() => setActiveTab("request")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all ${
            activeTab === "request"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <DollarSign className="h-5 w-5" />
          <span className="font-semibold">New Request</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all ${
            activeTab === "history"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Clock className="h-5 w-5" />
          <span className="font-semibold">History</span>
        </button>
      </div>

      {activeTab === "request" && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-gray-900">₹{availableBalance.toLocaleString()}</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="flex justify-around pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Min. Withdrawal</p>
                <p className="text-sm font-semibold text-gray-900">₹{minimumWithdrawal}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Processing Time</p>
                <p className="text-sm font-semibold text-gray-900">24-48 hrs</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Amount Selection</h3>
            <div className="grid grid-cols-3 gap-3">
              {[500, 1000, 1500].map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  disabled={quickAmount > availableBalance}
                  className={`py-3 rounded-lg font-semibold transition-all ${
                    parseInt(amount) === quickAmount
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                      : quickAmount > availableBalance
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ₹{quickAmount}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdrawal Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Wallet className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Enter amount (Min. ₹${minimumWithdrawal})`}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {amount && parseFloat(amount) > availableBalance && (
                  <p className="mt-1 text-sm text-red-600">Amount exceeds available balance</p>
                )}
                {amount && parseFloat(amount) < minimumWithdrawal && parseFloat(amount) > 0 && (
                  <p className="mt-1 text-sm text-red-600">Minimum withdrawal amount is ₹{minimumWithdrawal}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="Bank account number"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="Enter bank IFSC code"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Enter account holder name"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {amount && (
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Withdrawal Amount</span>
                  <span className="font-semibold text-gray-900">₹{parseFloat(amount || "0").toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-semibold text-gray-900">₹0</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">You will receive</span>
                  <span className="text-lg font-bold text-green-600">₹{parseFloat(amount || "0").toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Important Information</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li> Processing time: 24-48 business hours</li>
              <li> No processing fees charged</li>
              <li> Requires admin verification</li>
              <li> Ensure bank details are correct</li>
            </ul>
          </div>

          <button
            onClick={handleWithdrawalRequest}
            disabled={!amount || !bankAccount || !ifscCode || !accountHolderName || parseFloat(amount || "0") < minimumWithdrawal || parseFloat(amount || "0") > availableBalance || loading}
            className="w-full py-4 text-lg font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Submit Withdrawal Request"}
          </button>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {withdrawalHistory.filter((h: WithdrawalRequest) => h.status === "completed").length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {withdrawalHistory.filter((h: WithdrawalRequest) => h.status === "pending").length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  ₹{withdrawalHistory
                    .filter((h: WithdrawalRequest) => h.status === "completed")
                    .reduce((sum: number, h: WithdrawalRequest) => sum + h.amount, 0)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Amount</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {(["all", "completed", "approved", "pending", "rejected"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {historyLoading ? (
            <div className="p-12 text-center bg-white rounded-lg shadow-sm">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading withdrawal history...</p>
            </div>
          ) : withdrawalHistory.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-lg shadow-sm">
              <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Withdrawals Found</h3>
              <p className="text-gray-600 mb-6">
                {filterStatus === "all"
                  ? "You haven't made any withdrawals yet."
                  : `No ${filterStatus} withdrawals found.`}
              </p>
              <button
                onClick={() => setActiveTab("request")}
                className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-all"
              >
                Make New Withdrawal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawalHistory.map((item: WithdrawalRequest) => (
                <div key={item.id} className="p-6 bg-white rounded-lg shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">₹{item.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(item.requestDate || item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-semibold">
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-semibold text-gray-900">{item.paymentMethod || "Bank Transfer"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account:</span>
                      <span className="font-semibold text-gray-900">
                        ****{item.paymentDetails?.bankAccountNumber?.slice(-4) || ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IFSC:</span>
                      <span className="font-mono text-xs text-gray-700">{item.paymentDetails?.ifscCode || "N/A"}</span>
                    </div>
                    {item.adminNotes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800 font-semibold mb-1">Admin Note:</p>
                        <p className="text-sm text-blue-900">{item.adminNotes}</p>
                      </div>
                    )}
                    {item.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-xs text-red-800 font-semibold mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-900">{item.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
