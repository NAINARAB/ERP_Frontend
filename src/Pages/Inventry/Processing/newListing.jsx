// ProcessCards.jsx
import React from "react";

// (Optional) TypeScript types — keep as comments if you're in JS
// type SourceDetail = {
//   PRS_Id: string; Sour_Qty: number | string; Sour_Unit: string;
//   Product_Name: string; Godown_Name: string;
// };
// type DestinationDetail = {
//   PRD_Id: string; Dest_Qty: number | string; Dest_Unit: string;
//   Product_Name: string; Godown_Name: string;
// };
// type StaffDetail = { PRE_Id: string; EmpNameGet: string; EmpTypeGet: string; };
// export type ProcessRecord = {
//   PR_Id: string; PR_Inv_Id: string; BranchName: string; VoucherTypeGet: string;
//   GodownNameGet: string; P_No: string; BillType: string; PR_Status: string;
//   Process_date?: string; StartDateTime?: string; EndDateTime?: string;
//   Narration?: string;
//   SourceDetails?: SourceDetail[];
//   DestinationDetails?: DestinationDetail[];
//   StaffsDetails?: StaffDetail[];
// };
// export type Props = { data: ProcessRecord[] };

const formatDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  // Force Asia/Kolkata as per your data/timezone
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
};

const n = (val) => {
  if (val === null || val === undefined || val === "") return "-";
  const num = Number(val);
  return Number.isFinite(num) ? num.toLocaleString("en-IN") : String(val);
};

const badgeColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("complete")) return "#16a34a"; // green
  if (s.includes("pending") || s.includes("in progress")) return "#f59e0b"; // amber
  if (s.includes("cancel")) return "#dc2626"; // red
  return "#64748b"; // slate
};

export default function ProcessCards({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>No process records to display.</p>;
  }

  return (
    <div className="pr-wrap">
      {data.map((pr) => (
        <article className="pr-card" key={pr.PR_Id}>
          <header className="pr-head">
            <div>
              <h3>
                Process #{pr.P_No} <span className="muted">({pr.VoucherTypeGet})</span>
              </h3>
              <div className="sub">
                Inv: <strong>{pr.PR_Inv_Id}</strong> • Branch: {pr.BranchName} • Godown: {pr.GodownNameGet}
              </div>
            </div>
            <div className="right">
              <span
                className="badge"
                style={{ backgroundColor: badgeColor(pr.PR_Status) }}
                title={pr.PR_Status}
              >
                {pr.PR_Status || "—"}
              </span>
              <div className="dates">
                <div><span className="label">Process Date:</span> {formatDateTime(pr.Process_date)}</div>
                <div><span className="label">Start:</span> {formatDateTime(pr.StartDateTime)}</div>
                <div><span className="label">End:</span> {formatDateTime(pr.EndDateTime)}</div>
              </div>
            </div>
          </header>

          {pr.Narration && (
            <p className="narration">
              {pr.Narration}
            </p>
          )}

          {/* Source Details */}
          <section className="block">
            <h4>Source Details</h4>
            <div className="table">
              <div className="row head">
                <div>Product</div>
                <div>Qty</div>
                <div>Unit</div>
                <div>Godown</div>
              </div>
              {(pr.SourceDetails ?? []).map((s) => (
                <div className="row" key={s.PRS_Id}>
                  <div>{s.Product_Name}</div>
                  <div>{n(s.Sour_Qty)}</div>
                  <div>{s.Sour_Unit}</div>
                  <div>{s.Godown_Name}</div>
                </div>
              ))}
              {(pr.SourceDetails ?? []).length === 0 && (
                <div className="row empty"><div>No sources</div></div>
              )}
            </div>
          </section>

          {/* Destination Details */}
          <section className="block">
            <h4>Destination Details</h4>
            <div className="table">
              <div className="row head">
                <div>Product</div>
                <div>Qty</div>
                <div>Unit</div>
                <div>Godown</div>
              </div>
              {(pr.DestinationDetails ?? []).map((d) => (
                <div className="row" key={d.PRD_Id}>
                  <div>{d.Product_Name}</div>
                  <div>{n(d.Dest_Qty)}</div>
                  <div>{d.Dest_Unit}</div>
                  <div>{d.Godown_Name}</div>
                </div>
              ))}
              {(pr.DestinationDetails ?? []).length === 0 && (
                <div className="row empty"><div>No destinations</div></div>
              )}
            </div>
          </section>

          {/* Staff */}
          <section className="block">
            <h4>Staff</h4>
            <ul className="staff">
              {(pr.StaffsDetails ?? []).map((st) => (
                <li key={st.PRE_Id}>
                  <span className="emp">{st.EmpNameGet}</span>
                  <span className="type">{st.EmpTypeGet}</span>
                </li>
              ))}
              {(pr.StaffsDetails ?? []).length === 0 && (
                <li className="muted">No staff tagged</li>
              )}
            </ul>
          </section>
        </article>
      ))}

      {/* Tiny CSS scoped to this component */}
      <style>{`
        .pr-wrap { display: grid; gap: 16px; }
        .pr-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; background: #fff; }
        .pr-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
        .pr-head h3 { margin: 0 0 6px; font-size: 18px; }
        .sub { color: #475569; font-size: 14px; }
        .muted { color: #64748b; }
        .badge { color: #fff; padding: 6px 10px; border-radius: 999px; font-size: 12px; margin-left: auto; }
        .right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
        .dates { font-size: 12px; color: #475569; text-align: right; }
        .dates .label { color: #64748b; margin-right: 6px; }
        .narration { margin: 12px 0 0; background: #f8fafc; padding: 10px; border-radius: 8px; font-size: 14px; color: #0f172a; }
        .block { margin-top: 14px; }
        .block h4 { margin: 0 0 8px; font-size: 15px; color: #0f172a; }
        .table { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
        .row { display: grid; grid-template-columns: 2fr 0.8fr 0.8fr 1.2fr; gap: 12px; padding: 10px 12px; align-items: center; }
        .row.head { background: #f1f5f9; font-weight: 600; color: #0f172a; }
        .row:not(.head) { border-top: 1px solid #f1f5f9; }
        .row.empty > div { grid-column: 1 / -1; color: #64748b; font-style: italic; }
        .staff { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
        .staff li { display: flex; justify-content: space-between; background: #f8fafc; padding: 8px 10px; border-radius: 8px; }
        .staff .emp { font-weight: 600; color: #0f172a; }
        .staff .type { color: #475569; font-size: 13px; }
        @media (max-width: 640px) {
          .row { grid-template-columns: 1.8fr 0.8fr 0.8fr 1fr; }
          .right { align-items: flex-start; }
          .dates { text-align: left; }
        }
      `}</style>
    </div>
  );
}
