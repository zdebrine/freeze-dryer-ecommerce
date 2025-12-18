import { createClient } from "@/lib/supabase/server"

export async function OrderLogs({ orderId }: { orderId: string }) {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from("order_logs")
    .select(
      `
      *,
      profiles!order_logs_user_id_fkey (full_name)
    `,
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })

  if (!logs || logs.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet</p>
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-4 border-l-2 border-muted pl-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{log.action}</p>
              {log.new_status && (
                <span className="text-sm text-muted-foreground">
                  {log.previous_status} → {log.new_status}
                </span>
              )}
            </div>
            {log.notes && <p className="text-sm text-muted-foreground">{log.notes}</p>}
            <p className="text-xs text-muted-foreground">
              {new Date(log.created_at).toLocaleString()} • {log.profiles?.full_name}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
