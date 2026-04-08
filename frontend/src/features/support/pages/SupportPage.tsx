// frontend/src/features/support/pages/SupportPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send,
  FileQuestion,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  Divider,
  Heading,
  Input,
  PageHeading,
  Stack,
  Textarea,
} from "@/shared/components/ui";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FaqItem[] = [
  {
    category: "Getting Started",
    question: "How do I access the dashboard?",
    answer:
      "After logging in, you'll be automatically redirected to the dashboard. You can also click the SEMKO logo in the header anytime.",
  },
  {
    category: "Getting Started",
    question: "How do I change my password?",
    answer:
      "Click on your profile picture in the top-right corner, select 'Change password', and follow the instructions.",
  },
  {
    category: "Operations",
    question: "How do I create a new trip?",
    answer:
      "Navigate to Trips → New Trip, fill in the required details (vehicle, driver, route), and submit.",
  },
  {
    category: "Operations",
    question: "How do I record fuel consumption?",
    answer:
      "Go to Fuel → New Fuel Entry, select the vehicle, enter odometer reading and litres, then save.",
  },
  {
    category: "Maintenance",
    question: "How do I schedule vehicle maintenance?",
    answer:
      "Under Maintenance → Schedule, choose the vehicle, service type, due date, and assign a mechanic.",
  },
  {
    category: "Payroll",
    question: "How are payroll deductions calculated?",
    answer:
      "Deductions are based on configured tax rates, loan repayments, and benefits in the Payroll Settings.",
  },
];

export function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const filteredFaq = useMemo(
    () =>
      faqData.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const categories = useMemo(
    () => Array.from(new Set(filteredFaq.map((item) => item.category))),
    [filteredFaq]
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitSuccess(true);
    setIsSubmitting(false);
    setFormData({ name: "", email: "", subject: "", message: "" });
    window.setTimeout(() => setSubmitSuccess(false), 5000);
  };

  useEffect(() => {
    if (searchQuery === "") {
      setExpandedIndex(null);
    }
  }, [searchQuery]);

  return (
    <div className="container-fluid py-6 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <Badge variant="accent" className="mb-2">
          Help Center
        </Badge>
        <PageHeading>How can we help you?</PageHeading>
        <p className="text-text-muted">
          Find answers to common questions or contact our support team directly.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto p-6">
        <div className="relative">
          <FileQuestion className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <Input
            type="search"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search support articles"
          />
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Heading level={3}>Frequently Asked Questions</Heading>
            <span className="text-sm text-text-muted">{filteredFaq.length} articles</span>
          </div>

          {categories.map((category) => {
            const categoryFaqs = filteredFaq.filter(
              (item) => item.category === category
            );
            if (categoryFaqs.length === 0) return null;

            return (
              <div key={category} className="space-y-3">
                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
                  {category}
                </h4>
                <Card className="divide-y divide-surface-border">
                  {categoryFaqs.map((faq) => {
                    const globalIndex = faqData.findIndex(
                      (f) => f.question === faq.question
                    );
                    const isExpanded = expandedIndex === globalIndex;

                    return (
                      <div key={faq.question}>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedIndex(isExpanded ? null : globalIndex)
                          }
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-subtle transition-colors"
                        >
                          <span className="font-medium text-text-primary">
                            {faq.question}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-text-muted" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-text-muted" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 text-text-secondary">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </Card>
              </div>
            );
          })}

          {filteredFaq.length === 0 && (
            <Card className="p-8 text-center">
              <HelpCircle className="mx-auto h-12 w-12 text-text-muted" />
              <p className="mt-4 text-text-primary font-semibold">
                No matching questions found.
              </p>
              <p className="mt-2 text-sm text-text-muted">
                Try different keywords or contact support directly.
              </p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <Heading level={4} className="mb-0">
                Contact Support
              </Heading>
              <Badge variant="accent" size="xs">
                Available
              </Badge>
            </div>
            <Divider className="my-4" />
            <Stack spacing="md">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-accent-100 p-3 text-accent-700">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Email</p>
                  <a
                    href="mailto:support@semko.co.ke"
                    className="text-sm text-accent-600 hover:underline"
                  >
                    support@semko.co.ke
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-success/10 p-3 text-success-700">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Phone</p>
                  <a
                    href="tel:+254700000000"
                    className="text-sm text-accent-600 hover:underline"
                  >
                    +254 700 000 000
                  </a>
                  <p className="text-xs text-text-muted">Mon–Fri, 8am–5pm</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-warning/10 p-3 text-warning-700">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Live Chat</p>
                  <button className="text-sm text-accent-600 hover:underline" type="button">
                    Start a conversation
                  </button>
                </div>
              </div>
            </Stack>
          </Card>

          <Card className="p-6">
            <Heading level={4} className="mb-4">
              Submit a Ticket
            </Heading>
            {submitSuccess ? (
              <div className="rounded-3xl bg-success/10 p-4 text-center text-success-700">
                <p className="font-semibold">✓ Ticket submitted successfully!</p>
                <p className="mt-1 text-sm text-text-muted">
                  We'll respond within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Name
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Subject
                  </label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">
                    Message
                  </label>
                  <Textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  leftIcon={<Send className="h-4 w-4" />}
                  className="w-full"
                >
                  Send Message
                </Button>
              </form>
            )}
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm text-success-700">
              <span className="h-2.5 w-2.5 rounded-full bg-success-600 animate-pulse" />
              All systems operational
            </div>
            <p className="mt-3 text-xs text-text-muted">
              Last checked: {new Date().toLocaleString()}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
