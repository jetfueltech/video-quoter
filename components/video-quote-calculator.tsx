'use client'

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Film, Clock, Clapperboard, Users, Camera, CheckCircle2, MapPin, AlertCircle, Star, Quote, ChevronDown, ChevronUp } from 'lucide-react';

const ZAPIER_WEBHOOK_URL = '/api/sendtozapier'

type DeliverableType = {
  duration: string;
  type: string;
};

type FormDataType = {
  projectType: string;
  selectedGoals: string[];
  projectDetails: string;
  eventDays: number;
  eventCity: string;
  eventDeliverables: string[];
  otherDeliverables: DeliverableType[];
  addOns: string[];
  preProductionServices: string[];
  selectAllPreProduction: boolean;
  quoteRequest: {
    name: string;
    email: string;
    phone: string;
    company: string;
    additionalInfo: string;
  };
};

const projectTypes = [
  { value: "event-video", label: "Event Video" },
  { value: "commercial", label: "Commercial" },
  { value: "corporate-interview", label: "Corporate Interview" },
  { value: "product", label: "Product" },
  { value: "training", label: "Training" },
  { value: "advertising", label: "Advertising" }
];

const projectGoals: Record<string, string[]> = {
  "event-video": ["Document an Event", "Increase Brand Awareness", "Entertain Viewers", "Showcase Highlights", "Engage Attendees Post-Event", "Create Social Media Recap", "Capture Testimonials"],
  "commercial": ["Increase Brand Awareness", "Drive Sales", "Showcase Product/Service", "Create Social Media Engagement", "Educate About Brand", "Enhance Market Position", "Attract New Customers"],
  "corporate-interview": ["Educate About Company", "Showcase Leadership", "Internal Communication", "Share Industry Insights", "Build Trust", "Provide Updates", "Create Web/Social Content"],
  "product": ["Showcase Features/Benefits", "Drive Sales", "Educate on Usage", "Create Website Content", "Highlight Reviews", "Build Product Launch Anticipation", "Increase Brand Awareness"],
  "training": ["Educate Employees/Clients", "Ensure Compliance", "Enhance Skills", "Provide Onboarding", "Create Training Resources", "Improve Employee Retention", "Track Progress"],
  "advertising": ["Increase Brand Awareness", "Drive Sales", "Engage on Social Media", "Promote Offers", "Entertain Viewers", "Highlight USP", "Build Customer Loyalty"]
};

const eventAddOns: Record<string, number> = {
  "50 HQ Photography Shots": 500,
  "100 HQ Photography Shots": 750
};

const otherAddOns: Record<string, number> = {
  "On-Screen Talent": 750,
  "Set Design": 1000,
  "Teleprompter": 350,
  "Additional Crew Member": 400,
  "50 HQ Photography Shots": 500,
  "100 HQ Photography Shots": 750
};

const preProductionServices: Record<string, number> = {
  "Scriptwriting": 200,
  "Storyboarding": 200,
  "Location Scouting": 200,
  "Talent Casting": 200,
  "Props and Wardrobe": 200
};

const eventDeliverables: Record<string, number> = {
  "Event Stream": 1500,
  "Event Recording": 1250,
  "Event Recap Video": 1000,
  "Attendee Testimonials": 750,
  "Speaker Interviews": 900,
  "Social Media Promo": 600
};

const otherDeliverables: Record<string, number>= {
  "30 seconds": 1500,
  "60 seconds": 2250,
  "90 seconds": 3000,
  "2 minutes": 3500,
  "5 minutes": 5000
};

const deliverableTypes = ["Commercial", "YouTube Video", "Social Media Ad", "Corporate Video", "Product Demo", "Training Video", "Testimonial", "Explainer Video", "Brand Video"];

const getProjectTypeDescription = (type: string) => {
  switch (type) {
    case "event-video": return "Capture and showcase live events";
    case "commercial": return "Promote products or services";
    case "corporate-interview": return "Highlight company leadership and insights";
    case "product": return "Showcase product features and benefits";
    case "training": return "Create educational content for employees or clients";
    case "advertising": return "Create engaging ads for various platforms";
    default: return "Select a project type";
  }
};

const testimonials = [
  {
    name: "Sarah Johnson",
    company: "TechInnovate Solutions",
    text: "AUME Motion Arts transformed our complex product launch into a visually stunning narrative. Their attention to detail and creative approach exceeded our expectations. The video not only captured our product's essence but also resonated deeply with our target audience. A game-changer for our marketing strategy!",
    rating: 5
  },
  {
    name: "Michael Chen",
    company: "GreenEarth Nonprofits",
    text: "Working with AUME on our fundraising campaign video was an absolute pleasure. They have a unique ability to convey emotion and urgency through their work. The final product was so compelling that we saw a 40% increase in donations compared to previous years. Their professionalism and passion for storytelling truly sets them apart.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    company: "Culinary Creations Inc.",
    text: "AUME Motion Arts brought our recipes to life in ways we never imagined. Their food videography is nothing short of art. They captured the essence of our brand while making every dish look irresistible. Since launching the video series, our cookbook sales have skyrocketed. They're not just videographers; they're culinary storytellers!",
    rating: 5
  }
];

const companyBlurb = "We've worked with the likes of Chick-fil-A, Toyota, SMU, Tiff's Treats, and many more. We believe we are talented and have great creative eyes; however, what makes us stand out has nothing to do with creative video production. It's the little things! We will always answer your call or email, we will show up to every gig on time and prepared, and we will always put your piece of mind over our bottom line.";

export function VideoQuoteCalculator() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormDataType>({
    projectType: '',
    selectedGoals: [],
    projectDetails: '',
    eventDays: 1,
    eventCity: '',
    eventDeliverables: [],
    otherDeliverables: [{ duration: '', type: '' }],
    addOns: [],
    preProductionServices: [],
    selectAllPreProduction: false,
    quoteRequest: { name: '', email: '', phone: '', company: '', additionalInfo: '' }
  });
  const [priceEstimate, setPriceEstimate] = useState({ min: 0, max: 0 });
  const [expandedTestimonials, setExpandedTestimonials] = useState(false);

  useEffect(() => {
    calculatePriceEstimate();
  }, [formData]);

  useEffect(() => {
    if (step === 7) {
      sendToZapier(formData);
    }
  }, [step]);
  
  const calculatePriceEstimate = () => {
    let basePrice = 0;
    let additionalCosts = 0;

    if (formData.projectType === 'event-video') {
      basePrice = 3000 * formData.eventDays;
      
      formData.eventDeliverables.forEach(deliverable => {
        if (deliverable && deliverable in eventDeliverables) {
            additionalCosts += eventDeliverables[deliverable as keyof typeof eventDeliverables];
        }
      });
    } else {
      basePrice = 3500;

      formData.otherDeliverables.forEach(deliverable => {
        if (deliverable.duration && deliverable.duration in otherDeliverables) {
            additionalCosts += otherDeliverables[deliverable.duration as keyof typeof otherDeliverables];
        }
      });
    }

    formData.addOns.forEach((addOn: string) => {
      additionalCosts += formData.projectType === 'event-video' ? eventAddOns[addOn] : otherAddOns[addOn];
    });

    if (formData.selectAllPreProduction) {
      additionalCosts += 750;
    } else {
      formData.preProductionServices.forEach((service: string) => {
        additionalCosts += preProductionServices[service];
      });
    }

    const totalCost = basePrice + additionalCosts;
    const minPrice = Math.round(totalCost * 0.9);
    const maxPrice = Math.round(totalCost * 1.1);

    setPriceEstimate({ min: minPrice, max: maxPrice });
  };

  const handleInputChange = (field: string, value: DeliverableType[] | string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalChange = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(goal)
        ? prev.selectedGoals.filter(g => g !== goal)
        : [...prev.selectedGoals, goal]
    }));
  };

  const handleDeliverableChange = (deliverable: string) => {
    setFormData(prev => ({
      ...prev,
      eventDeliverables: prev.eventDeliverables.includes(deliverable)
        ? prev.eventDeliverables.filter(d => d !== deliverable)
        : [...prev.eventDeliverables, deliverable]
    }));
  };

  const handleOtherDeliverableChange = (index: number, field: string, value: string) => {
    const newDeliverables = [...formData.otherDeliverables];
    newDeliverables[index] = { ...newDeliverables[index], [field]: value };
    handleInputChange('otherDeliverables', newDeliverables);
  };

  const handleAddOnChange = (addOn: string) => {
    setFormData(prev => ({
      ...prev,
      addOns: prev.addOns.includes(addOn)
        ? prev.addOns.filter(a => a !== addOn)
        : [...prev.addOns, addOn]
    }));
  };

  const handlePreProductionServiceChange = (service: string) => {
    if (service === 'selectAll') {
      setFormData(prev => ({
        ...prev,
        selectAllPreProduction: !prev.selectAllPreProduction,
        preProductionServices: prev.selectAllPreProduction ? [] : Object.keys(preProductionServices)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preProductionServices: prev.preProductionServices.includes(service)
          ? prev.preProductionServices.filter(s => s !== service)
          : [...prev.preProductionServices, service],
        selectAllPreProduction: false
      }));
    }
  };

  const handleQuoteRequestChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      quoteRequest: { ...prev.quoteRequest, [name]: value }
    }));
  };

  const handleNext = () => {
    setStep(prevStep => prevStep + 1);
  };

  const handlePrevious = () => {
    setStep(prevStep => prevStep - 1);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendToZapier(formData);
    handleNext();
  };

  const renderTestimonialsAndAbout = () => (
    <Card className="mt-6 p-6 bg-white relative overflow-hidden">
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center">
            <Quote className="w-5 h-5 mr-2 text-gray-500" />
            Client Testimonials
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedTestimonials(!expandedTestimonials)}
            className="flex items-center"
          >
            {expandedTestimonials ? (
              <>
                Show Less <ChevronUp className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Show More <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
        <AnimatePresence>
          {testimonials.slice(0, expandedTestimonials ? testimonials.length : 1).map((testimonial, index) => (
            <motion.div
              key={index}
              initial={expandedTestimonials ? { opacity: 0, height: 0 } : false}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2 bg-gray-50 p-4 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{testimonial.name}</span>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 italic">&quot;{testimonial.text}&quot;</p>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">About AUME Motion Arts</h3>
          <p className="text-sm text-gray-600">{companyBlurb}</p>
        </div>
      </div>
    </Card>
  );

  const sendToZapier = async (data: FormDataType) => {
    try {
      const zapierData = {
        ...data,
        priceEstimate
      }
      console.log('zapierData submitted:', zapierData);
      const response = await fetch(ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        body: JSON.stringify(zapierData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to send data to Zapier')
      }
    } catch (error) {
      console.error('Error sending data to Zapier:', error)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Select Your Project Type</h2>
            <p className="text-gray-600">Choose the type of video project you&apos;re looking to create. This will help us tailor the quote to your specific needs.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projectTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={formData.projectType === type.value ? "default" : "outline"}
                  className="h-auto py-4 flex flex-col items-center justify-center text-center"
                  onClick={() => handleInputChange('projectType', type.value)}
                >
                  <span className="text-lg font-semibold">{type.label}</span>
                  <span className="text-sm text-gray-500 mt-1 px-2">{getProjectTypeDescription(type.value)}</span>
                </Button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Select Your Project Goals</h2>
            <p className="text-gray-600">Choose the primary goals for your {projectTypes.find(t => t.value === formData.projectType)?.label} project:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {
              projectGoals[formData.projectType].map((goal: string) => (
                <div
                  key={goal}
                  className={`flex items-start space-x-2 bg-gray-50 p-3 rounded-lg cursor-pointer transition-colors ${
                    formData.selectedGoals.includes(goal) ? 'bg-gray-200' : ''
                  }`}
                  onClick={() => handleGoalChange(goal)}
                >
                  <Checkbox
                    id={goal}
                    checked={formData.selectedGoals.includes(goal)}
                    onCheckedChange={() => handleGoalChange(goal)}
                  />
                  <div className="flex-grow">
                    <Label htmlFor={goal} className="font-medium">{goal}</Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return formData.projectType === 'event-video' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Event Details</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="eventDays" className="block mb-2">Number of days to be filmed</Label>
                <Input
                  id="eventDays"
                  type="number"
                  min="1"
                  value={formData.eventDays}
                  onChange={(e) => handleInputChange('eventDays', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="eventCity" className="block mb-2">Event City</Label>
                <Input
                  id="eventCity"
                  type="text"
                  value={formData.eventCity}
                  onChange={(e) => handleInputChange('eventCity', e.target.value)}
                  className="w-full"
                  placeholder="Enter the city where the event will take place"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Project Details</h2>
            <p className="text-gray-600">Provide some details about your project to help us understand your needs better.</p>
            <Textarea
              placeholder="Share details about your vision, target audience, key messages, or any specific requirements..."
              value={formData.projectDetails}
              onChange={(e) => handleInputChange('projectDetails', e.target.value)}
              rows={6}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-500"
            />
          </div>
        );
      case 4:
        return formData.projectType === 'event-video' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Event Deliverables</h2>
            <p className="text-gray-600">Select the deliverables you need for your event:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(eventDeliverables).map((deliverable) => (
                <div
                  key={deliverable}
                  className={`flex items-start space-x-2 bg-gray-50 p-3 rounded-lg cursor-pointer transition-colors ${
                    formData.eventDeliverables.includes(deliverable) ? 'bg-gray-200' : ''
                  }`}
                  onClick={() => handleDeliverableChange(deliverable)}
                >
                  <Checkbox
                    id={deliverable}
                    checked={formData.eventDeliverables.includes(deliverable)}
                    onCheckedChange={() => handleDeliverableChange(deliverable)}
                  />
                  <div className="flex-grow">
                    <Label htmlFor={deliverable} className="font-medium">{deliverable}</Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Final Deliverables</h2>
            <p className="text-gray-600">Specify the details of your video deliverables:</p>
            {formData.otherDeliverables.map((deliverable, index) => (
              <Card key={index} className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Film className="w-6 h-6 text-gray-500" />
                    </div>
                    <Select value={deliverable.type} onValueChange={(v) => handleOtherDeliverableChange(index, 'type', v)}>
                      <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>{deliverableTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Clock className="w-6 h-6 text-gray-500" />
                    </div>
                    <Select value={deliverable.duration} onValueChange={(v) => handleOtherDeliverableChange(index, 'duration', v)}>
                      <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Duration" /></SelectTrigger>
                      <SelectContent>{Object.keys(otherDeliverables).map(duration => <SelectItem key={duration} value={duration}>{duration}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            ))}
            <Button onClick={() => handleInputChange('otherDeliverables', [...formData.otherDeliverables, { duration: '', type: '' }])} variant="outline" className="w-full">
              Add Deliverable
            </Button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Add-Ons</h2>
            <p className="text-gray-600">Select any additional services you&apos;d like to include:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(formData.projectType === 'event-video' ? eventAddOns : otherAddOns).map((addOn) => (
                <div
                  key={addOn}
                  className={`flex items-start space-x-2 bg-gray-50 p-3 rounded-lg cursor-pointer transition-colors ${
                    formData.addOns.includes(addOn) ? 'bg-gray-200' : ''
                  }`}
                  onClick={() => handleAddOnChange(addOn)}
                >
                  <Checkbox
                    id={addOn}
                    checked={formData.addOns.includes(addOn)}
                    onCheckedChange={() => handleAddOnChange(addOn)}
                  />
                  <div className="flex-grow">
                    <Label htmlFor={addOn} className="font-medium">{addOn}</Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return formData.projectType !== 'event-video' ? 
        (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Pre-production Services</h2>
            <p className="text-gray-600">Select any pre-production services you need:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className={`flex items-start space-x-2 bg-gray-50 p-3 rounded-lg cursor-pointer transition-colors ${
                  formData.selectAllPreProduction ? 'bg-gray-200' : ''
                }`}
                onClick={() => handlePreProductionServiceChange('selectAll')}
              >
                <Checkbox
                  id="selectAll"
                  checked={formData.selectAllPreProduction}
                  onCheckedChange={() => handlePreProductionServiceChange('selectAll')}
                />
                <div className="flex-grow">
                  <Label htmlFor="selectAll" className="font-medium">Select All</Label>
                </div>
              </div>
              {Object.keys(preProductionServices).map((service) => (
                <div
                  key={service}
                  className={`flex items-start space-x-2 bg-gray-50 p-3 rounded-lg cursor-pointer transition-colors ${
                    formData.preProductionServices.includes(service) ? 'bg-gray-200' : ''
                  }`}
                  onClick={() => handlePreProductionServiceChange(service)}
                >
                  <Checkbox
                    id={service}
                    checked={formData.preProductionServices.includes(service)}
                    onCheckedChange={() => handlePreProductionServiceChange(service)}
                    disabled={formData.selectAllPreProduction}
                  />
                  <div className="flex-grow">
                    <Label htmlFor={service} className="font-medium">{service}</Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Project Summary</h2>
            <Card className="p-6 bg-white relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center space-x-2">
                  <Clapperboard className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  <h3 className="text-lg font-semibold">Project Type</h3>
                </div>
                <p>{projectTypes.find(t => t.value === formData.projectType)?.label}</p>
                <Separator />
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  <h3 className="text-lg font-semibold">Goals</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedGoals.map(goal => (
                    <Badge key={goal} variant="secondary">{goal}</Badge>
                  ))}
                </div>
                <Separator />
                <div className="flex items-center space-x-2">
                  <MapPin className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  <h3 className="text-lg font-semibold">Event Details</h3>
                </div>
                <p><strong>Event Duration:</strong> {formData.eventDays} day(s)</p>
                <p><strong>Event Location:</strong> {formData.eventCity}</p>
                <Separator />
                <div className="flex items-center space-x-2">
                  <Film className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  <h3 className="text-lg font-semibold">Event Deliverables</h3>
                </div>
                <ul className="list-disc list-inside">
                  {formData.eventDeliverables.map(deliverable => (
                    <li key={deliverable}>{deliverable}</li>
                  ))}
                </ul>
                <Separator />
                <div className="flex items-center space-x-2">
                  <Camera className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  <h3 className="text-lg font-semibold">Add-Ons</h3>
                </div>
                <ul className="list-disc list-inside">
                  {formData.addOns.map(addOn => (
                    <li key={addOn}>{addOn}</li>
                  ))}
                </ul>
                <div className="flex items-center justify-between mt-6">
                  <Button onClick={handleNext} className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
                    Start Project <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
            {renderTestimonialsAndAbout()}
          </div>
        );
      case 7:
        return formData.projectType !== 'event-video' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Project Summary</h2>
            <Card className="p-6 bg-white relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center space-x-2">
                  <Clapperboard className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  <h3 className="text-lg font-semibold">Project Type</h3>
                </div>
                <p>{projectTypes.find(t => t.value === formData.projectType)?.label}</p>
                <Separator />
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  <h3 className="text-lg font-semibold">Goals</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedGoals.map(goal => (
                    <Badge key={goal} variant="secondary">{goal}</Badge>
                  ))}
                </div>
                <Separator />
                <div className="flex items-center space-x-2">
                  <Film className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  <h3 className="text-lg font-semibold">Deliverables</h3>
                </div>
                <ul className="list-disc list-inside">
                  {formData.otherDeliverables.map((deliverable, index) => (
                    <li key={index}>{deliverable.type} ({deliverable.duration})</li>
                  ))}
                </ul>
                <Separator />
                <div className="flex items-center space-x-2">
                  <Camera className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  <h3 className="text-lg font-semibold">Add-Ons</h3>
                </div>
                <ul className="list-disc list-inside">
                  {formData.addOns.map(addOn => (
                    <li key={addOn}>{addOn}</li>
                  ))}
                </ul>
                <Separator />
                <div className="flex items-center space-x-2">
                  <Users className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  <h3 className="text-lg font-semibold">Pre-production Services</h3>
                </div>
                <ul className="list-disc list-inside">
                  {formData.selectAllPreProduction ? (
                    <li>All Pre-production Services</li>
                  ) : (
                    formData.preProductionServices.map(service => (
                      <li key={service}>{service}</li>
                    ))
                  )}
                </ul>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">Estimated Price Range</h3>
                    </div>
                    <p className="text-2xl font-bold">${priceEstimate.min.toLocaleString()} - ${priceEstimate.max.toLocaleString()}</p>
                  </div>
                  <Button onClick={handleNext} className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
                    Start Project <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-4" role="alert">
                  <div className="flex items-center">
                    <AlertCircle className="w-6 h-6 mr-2" />
                    <p className="font-bold">Preliminary Quote Estimate</p>
                  </div>
                  <p className="mt-2">This is a preliminary quote estimate based on the information provided. For a final quote, please select &quot;Start Project&quot; to have our team review your project details and provide an accurate quote.</p>
                </div>
              </div>
            </Card>
            {renderTestimonialsAndAbout()}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Quote Request</h2>
            <p className="text-gray-600">Please provide your contact information to receive your personalized quote:</p>
            <div className="space-y-4">
              <Input name="name" placeholder="Name" value={formData.quoteRequest.name} onChange={handleQuoteRequestChange} required />
              <Input name="email" type="email" placeholder="Email" value={formData.quoteRequest.email} onChange={handleQuoteRequestChange} required />
              <Input name="phone" type="tel" placeholder="Phone(optional)" value={formData.quoteRequest.phone} onChange={handleQuoteRequestChange} />
              <Input name="company" placeholder="Company Name" value={formData.quoteRequest.company} onChange={handleQuoteRequestChange} />
              <Textarea name="additionalInfo" placeholder="Additional Information" value={formData.quoteRequest.additionalInfo} onChange={handleQuoteRequestChange} rows={3} />
            </div>
            <Button type="submit" className="w-full">Submit Quote Request</Button>
          </form>
        );
      case 8:
        return formData.projectType !== 'event-video' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Quote Request</h2>
            <p className="text-gray-600">Please provide your contact information to receive your personalized quote:</p>
            <div className="space-y-4">
              <Input name="name" placeholder="Name" value={formData.quoteRequest.name} onChange={handleQuoteRequestChange} required />
              <Input name="email" type="email" placeholder="Email" value={formData.quoteRequest.email} onChange={handleQuoteRequestChange} required />
              <Input name="phone" type="tel" placeholder="Phone" value={formData.quoteRequest.phone} onChange={handleQuoteRequestChange} required />
              <Input name="company" placeholder="Company Name" value={formData.quoteRequest.company} onChange={handleQuoteRequestChange} />
              <Textarea name="additionalInfo" placeholder="Additional Information" value={formData.quoteRequest.additionalInfo} onChange={handleQuoteRequestChange} rows={3} />
            </div>
            <Button type="submit" className="w-full">Submit Quote Request</Button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto" />
            </motion.div>
            <h2 className="text-3xl font-semibold text-gray-800">Thank You!</h2>
            <p className="text-xl text-gray-600">Your quote request has been submitted successfully. We&apos;ll be in touch shortly with your personalized video production plan!</p>
          </div>
        );
      case 9:
        return (
          <div className="space-y-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto" />
            </motion.div>
            <h2 className="text-3xl font-semibold text-gray-800">Thank You!</h2>
            <p className="text-xl text-gray-600">Your quote request has been submitted successfully. We&apos;ll be in touch shortly with your personalized video production plan!</p>
          </div>
        );
      default:
        return null;
    }
  };

  const totalSteps = formData.projectType === 'event-video' ? 8 : 9;

  return (
    <div className="min-h-screen bg-white p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Create Your Video Production Quote</h1>
        <Card className="bg-white shadow-xl rounded-2xl overflow-hidden border-t-4 border-gray-500">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                {[...Array(totalSteps)].map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                      index + 1 === step ? 'bg-gray-500' : index + 1 < step ? 'bg-gray-300' : 'bg-gray-200'
                    }`}
                    animate={index + 1 === step ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-gray-500">Step {step} of {totalSteps}</p>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
            {step < totalSteps && step !== (formData.projectType === 'event-video' ? 7 : 8) && (
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <Button 
                    onClick={handlePrevious}
                    variant="outline"
                    className="font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                )}
                <Button 
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !formData.projectType) ||
                    (step === 2 && formData.selectedGoals.length === 0) ||
                    (step === 3 && formData.projectType === 'event-video' && (!formData.eventDays || !formData.eventCity)) ||
                    (step === 4 && formData.projectType === 'event-video' && formData.eventDeliverables.length === 0) ||
                    (step === 4 && formData.projectType !== 'event-video' && formData.otherDeliverables.some(d => !d.duration || !d.type))
                  }
                  className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 ml-auto"
                >
                  {(step === 6 && formData.projectType === 'event-video') || (step === 7 && formData.projectType !== 'event-video') ? 'Start Project' : 'Next'} <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}