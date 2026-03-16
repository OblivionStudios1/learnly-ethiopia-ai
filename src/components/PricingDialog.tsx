import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Upload, Video } from "lucide-react";

interface PricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPlan: (plan: string) => void;
}

const PricingDialog = ({ open, onOpenChange, onSelectPlan }: PricingDialogProps) => {
  const plans = [
    {
      name: "Basic",
      price: "$10",
      icon: Video,
      features: [
        "Watch unlimited educational videos",
        "Ad-free experience",
        "Save favorite videos",
        "Track your learning progress",
      ],
      restrictions: [
        "❌ No AI assistance",
        "❌ Can't upload videos",
      ],
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Pro",
      price: "$20",
      icon: Sparkles,
      popular: true,
      features: [
        "Everything in Basic",
        "AI assistance (Gemini Flash)",
        "1 video upload per day",
        "Priority support",
        "Ask unlimited questions",
      ],
      restrictions: [],
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Premium",
      price: "$30",
      icon: Upload,
      features: [
        "Everything in Pro",
        "AI assistance (Gemini 2.5 Pro)",
        "Unlimited video uploads",
        "Advanced analytics",
        "Early access to new features",
      ],
      restrictions: [],
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">Choose Your Plan</DialogTitle>
          <p className="text-muted-foreground text-center">Select the plan that works best for you</p>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative p-6 space-y-4 transition-all hover:scale-105 ${
                  plan.popular ? "border-2 border-primary shadow-xl" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 min-h-[200px]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.restrictions.map((restriction) => (
                    <li key={restriction} className="flex items-start gap-2">
                      <span className="text-sm text-muted-foreground">{restriction}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => onSelectPlan(plan.name.toLowerCase())}
                  className={`w-full ${plan.popular ? "shadow-elegant" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingDialog;
