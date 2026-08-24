import { useState } from "react";
import { ChevronDown, HelpCircle, LifeBuoy, Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How do I create a new trip?",
    a: "Go to My Trips and tap \"Create New Trip\". Add your destination, dates, budget and interests — GlobeTrotter will suggest places and activities for you.",
  },
  {
    q: "Can I plan a multi-city trip?",
    a: "Yes. In the itinerary builder you can add multiple city stops, assign arrival and departure dates, and the day timeline updates automatically.",
  },
  {
    q: "How is my budget calculated?",
    a: "Your budget is split across accommodation, transport, activities, food and other expenses. Activity costs are estimated from the catalog and summed in your trip currency.",
  },
  {
    q: "Can I share a trip with friends?",
    a: "Open a trip and choose Share. You can make it private, shareable by link, or public, and invite collaborators by email.",
  },
  {
    q: "Is my data synced across devices?",
    a: "Signed-in trips sync to your account. Drafts autosave as you plan so you never lose progress.",
  },
];

export function HelpSupportPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both fields");
      return;
    }
    toast.success("Support request sent", {
      description: "We'll get back to you by email shortly.",
    });
    setSubject("");
    setMessage("");
  };

  return (
      <AppShell
        title="Help & Support"
      description="Find answers, browse common questions, or contact our team."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <HelpCircle className="h-5 w-5 text-primary" /> Frequently asked
          </h2>
          {FAQS.map((item, i) => (
            <Card key={i} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
                aria-expanded={open === i}
              >
                <span className="text-sm font-medium text-foreground">{item.q}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    open === i ? "rotate-180" : "",
                  )}
                />
              </button>
              {open === i ? (
                <p className="border-t border-subtle-border px-4 py-3 text-sm text-muted-foreground">
                  {item.a}
                </p>
              ) : null}
            </Card>
          ))}
        </section>

        <section className="space-y-4">
          <Card className="space-y-4 p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <MessageSquare className="h-5 w-5 text-primary" /> Contact support
            </h2>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What do you need help with?"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail"
                  rows={5}
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                <Send className="mr-1.5 h-4 w-4" /> Send request
              </Button>
            </form>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Email us</p>
                <p className="text-xs text-muted-foreground">support@globetrotter.app</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <LifeBuoy className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Help center</p>
                <p className="text-xs text-muted-foreground">Guides & tutorials</p>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default HelpSupportPage;
