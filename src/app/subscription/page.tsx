"use client";

import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";
import { Loader } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { SubscriptionPlans } from "@/features/subscriptions/components/subscription-plans";
import { CurrentPlan } from "@/features/subscriptions/components/current-plan";
import { PaymentMethods } from "@/features/subscriptions/components/payment-methods";
import { BillingHistory } from "@/features/subscriptions/components/billing-history";

const SubscriptionPage = () => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  // Refresh subscription data when the page loads
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["subscription"] });
  }, [queryClient]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    redirect("/");
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription & Billing</h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription, payment methods, and billing history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <CurrentPlan />
          <SubscriptionPlans />
        </div>
        <div className="space-y-8">
          <PaymentMethods />
          <BillingHistory />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
