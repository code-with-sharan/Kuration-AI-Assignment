"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Plus,
  LayoutGrid,
  MoreVertical,
  Clock,
  PlayCircle,
  Send,
  BookOpen,
  HelpCircle,
  MessageSquare,
  LogOut,
  Menu,
  Building2,
  Globe,
  MapPin,
  Users,
  Calendar,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import useFirebaseAuth from "@/lib/firebase/useFirebaseAuth";
import { GoogleAuthProvider } from "firebase/auth";
import { AbstractApiResponse } from "@/app/api/enrich/route";

export function Homepage() {
  const [inputValue, setInputValue] = useState("");
  const [enrichedData, setEnrichedData] = useState<AbstractApiResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRecord, setIsFetchingRecord] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Array<{ domain: string }>>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const { authUser, signInWithPopup, signOut } = useFirebaseAuth();
  const isLoggedIn = authUser !== null;

  useEffect(() => {
    const fetchUserHistory = async () => {
      const response = await fetch("/api/history", {
        headers: {
          Authorization: `Bearer ${authUser?.token}`,
        },
      }).then((res) => res.json());

      if (response.error) {
        console.error(response.error);
        return;
      }

      console.log({ response });

      /**
       * {
    "reddit.com": {
        "last_visited": {
            "_seconds": 1731590670,
            "_nanoseconds": 605000000
        }
    },
    "google.com": {
        "last_visited": {
            "_seconds": 1731590806,
            "_nanoseconds": 936000000
        }
    },
    "rethinkux.com": {
        "last_visited": {
            "_seconds": 1731590826,
            "_nanoseconds": 471000000
        }
    }
}
       */

      const domainKeys = Object.keys(response.history) || [];

      setHistory(domainKeys.map((domain) => ({ domain })));
    };

    fetchUserHistory();
  }, [authUser]);

  const handleLogin = () => {
    signInWithPopup(new GoogleAuthProvider());
  };

  const handleLogout = () => {
    signOut();
    setEnrichedData(null);
    setShowResults(false);
    setInputValue("");
    setError("");
    setHistory([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await enrichData(inputValue);
  };

  const enrichData = async (input: string) => {
    // Extract domain from input
    // If input is url or email

    let domain: string | null = input;
    if (input.includes("http")) {
      domain = new URL(input).hostname;
    } else if (input.includes("@")) {
      domain = input.split("@")[1] || null;
    }

    if (!domain) {
      setError("Please enter a valid URL or email address.");
      return;
    }
    setIsLoading(true);
    setError("");
    setProgress(0);
    setShowResults(false);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 20;
        });
      }, 500);

      const data = await fetch("/api/enrich", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authUser?.token}`,
        },
        body: JSON.stringify({ domain }),
      }).then((res) => res.json());

      if (data.error) {
        setError(data.error);
        clearInterval(interval);
        setProgress(100);
        setIsLoading(false);
        return;
      }
      setEnrichedData(data);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setShowResults(true), 500);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
      setError("Failed to enrich lead data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowResults(false);
    setEnrichedData(null);
    setProgress(0);
  };

  const handleHistoryClick = async (item: { domain: string }) => {
    setIsFetchingRecord(true);
    setInputValue(item.domain);

    try {
      await enrichData(item.domain);
      setShowResults(true);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
      setError("Failed to fetch record. Please try again.");
    } finally {
      setIsFetchingRecord(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b p-4 flex justify-between items-center">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={20}
            height={20}
            className=""
          />

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu />
          </Button>
        </header>

        {/* Left Sidebar */}
        <div
          className={`w-full md:w-16 bg-white border-r flex flex-col items-center py-4 ${
            isMobileMenuOpen ? "block" : "hidden"
          } md:block`}
        >
          <div className="mb-4 hidden md:block p-4">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} />
          </div>
          <div className="flex-1 flex flex-col items-center gap-4 md:mt-4">
            <Button size="icon" variant="ghost" className="text-purple-600">
              <Plus />
            </Button>
            <Button size="icon" variant="ghost">
              <LayoutGrid />
            </Button>
            <Button size="icon" variant="ghost">
              <MoreVertical />
            </Button>
            <Button size="icon" variant="ghost">
              <Clock />
            </Button>
          </div>
          {isLoggedIn && (
            <div className="mt-auto pt-4 flex flex-col items-center gap-4 border-t border-gray-200 w-full">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleLogout}
                className="text-red-500"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
                U
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <h1 className="text-2xl font-semibold mb-6">Lead Enrichment Tool</h1>
          <Card className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6">
              <CardTitle className="text-xl font-bold">
                Enrich Your Lead Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {!isLoggedIn ? (
                <Button
                  onClick={handleLogin}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300"
                >
                  Login with Google
                </Button>
              ) : !showResults ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Enter website URL or email address"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Enrich Lead Data"
                    )}
                  </Button>
                </form>
              ) : (
                enrichedData && (
                  <div className="space-y-6">
                    <Button
                      onClick={handleBack}
                      variant="ghost"
                      className="mb-4"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Search
                    </Button>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={
                            enrichedData.logo ||
                            `https://logo.clearbit.com/${enrichedData.domain}`
                          }
                          alt={enrichedData.company_name || "Company Logo"}
                          className="h-12 w-12"
                        />
                        <h2 className="text-2xl font-bold">
                          {enrichedData.company_name || enrichedData.domain}
                        </h2>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <span>{enrichedData.domain}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span>{enrichedData.country || "-"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-gray-400" />
                        <span>
                          Employees:{" "}
                          {enrichedData.employee_count
                            ? enrichedData.employee_count.toLocaleString()
                            : "-"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <span>{enrichedData.industry || "-"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span>Founded: {enrichedData.year_founded || "-"}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full flex items-center justify-center space-x-2"
                      variant="outline"
                      onClick={()=>{
                        if(enrichedData.linkedin_url){
                          window.open(`https://${enrichedData.linkedin_url}`, '_blank');
                        }
                      }}
                    >
                      <span>View Company Profile</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-3 gap-4">
                      <Card className="bg-gray-50 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold">
                          {enrichedData.employee_count || "-"}
                        </div>
                        <div className="text-gray-500">Employees</div>
                      </Card>
                      <Card className="bg-gray-50 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold">
                          {enrichedData.year_founded || "-"}
                        </div>
                        <div className="text-gray-500">Year Founded</div>
                      </Card>
                      <Card className="bg-gray-50 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold">
                          {enrichedData.industry}
                        </div>
                        <div className="text-gray-500">Industry</div>
                      </Card>
                    </div>
                  </div>
                )
              )}

              {error && <p className="text-red-500 text-center">{error}</p>}

              {isLoading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-500 text-center">
                    Enriching data...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {history.length > 0 && (
            <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
              <CardHeader className="bg-gray-100 p-4">
                <CardTitle className="text-lg font-semibold">
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {isFetchingRecord && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-500 text-center">
                      Fetching record...
                    </p>
                  </div>
                )}
                <ul className="space-y-2">
                  {history.map((item, index) => (
                    <li
                      key={index}
                      className="bg-gray-50 p-2 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleHistoryClick(item)}
                    >
                      {item.domain}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-full md:w-80 bg-white p-4 md:p-6 overflow-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">
                How to get started:
              </h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-xl cursor-not-allowed">
                    <h3 className="text-xl mb-2">Product tour</h3>
                    <p className="mb-4">Learn how to enrich your lead data!</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white text-blue-600 hover:bg-gray-100"
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Watch video
                    </Button>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Demo purposes only. This feature is not functional.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div>
              <p className="text-center text-gray-600 mb-4">
                Chat with your AI agent to clarify your requirements and get
                great lead insights!
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-gray-100 rounded-lg p-3 mb-4 cursor-not-allowed">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Ask about lead enrichment..."
                        className="flex-1"
                        disabled
                      />
                      <Button
                        size="icon"
                        className="bg-purple-500 hover:bg-purple-600"
                        disabled
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Demo purposes only. Chat is not functional.</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex flex-wrap gap-2 mb-6">
                {["enrich a lead", "bulk enrichment", "API access"].map(
                  (text) => (
                    <Tooltip key={text}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gray-50 cursor-not-allowed"
                          disabled
                        >
                          {text}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Demo purposes only. This button is not functional.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">
                Tutorials and support
              </h2>
              <div className="space-y-4">
                {[
                  {
                    icon: BookOpen,
                    text: "Tutorials",
                    description: "Learn about features.",
                  },
                  {
                    icon: HelpCircle,
                    text: "FAQ",
                    description: "Common questions.",
                  },
                  {
                    icon: MessageSquare,
                    text: "Help",
                    description: "We're here to help!",
                  },
                ].map(({ icon: Icon, text, description }) => (
                  <Tooltip key={text}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start cursor-not-allowed"
                        disabled
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {text}
                        <span className="text-gray-500 ml-2">
                          {description}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Demo purposes only. This link is not functional.</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer and Meet Developer FAB */}
          <div className="mt-8 space-y-4 relative pb-16">
            <Card className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600">
                Disclaimer: This is a demo application. The lead enrichment
                functionality is simulated for demonstration purposes.
              </p>
            </Card>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="fixed bottom-4 right-4 md:bottom-8 md:right-8 rounded-full w-16 h-16 shadow-lg bg-purple-500 hover:bg-purple-600 text-white p-3"
                onClick={() => window.open("https://wa.link/mfde56", "_blank")}
              >
                <MessageSquare className="h-8 w-8" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Meet the Developer</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
