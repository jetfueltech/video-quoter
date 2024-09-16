'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Film, Clock, Clapperboard, Users, Camera, CheckCircle2, MapPin, AlertCircle, Star, Quote, ChevronDown, ChevronUp } from 'lucide-react';

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
  productionHours: number | 'not-sure';
  productionType: 'video' | 'photo' | 'photoVideo';
  otherDeliverables: DeliverableType[];
  addOns: string[];
  preProductionServices: string[];
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
  { value: "training", label: "Training" }
];

const projectGoals: Record<string, string[]> = {
  "event-video": ["Document an Event", "Increase Brand Awareness", "Entertain Viewers", "Showcase Highlights", "Engage Attendees Post-Event", "Create Social Media Recap", "Capture Testimonials"],
  "commercial": ["Increase Brand Awareness", "Drive Sales", "Showcase Product/Service", "Create Social Media Engagement", "Educate About Brand", "Recruit Talent"],
  "corporate-interview": ["Educate About Company", "Showcase Leadership", "Internal Communication", "Share Industry Insights", "Build Trust", "Provide Updates", "Create Web/Social Content"],
  "training": ["Educate Employees/Clients", "Ensure Compliance", "Enhance Skills", "Provide Onboarding", "Create Training Resources", "Improve Employee Retention", "Track Progress"]
};

const productionRates: Record<string, Record<number, number>> = {
  video: {
    4: 2000,
    6: 3000,
    8: 4000,
    12: 6000
  },
  photo: {
    4: 800,
    6: 1200,
    8: 1600,
    12: 2400
  },
  photoVideo: {
    4: 2500,
    6: 3800,
    8: 5100,
    12: 7500
  }
};

const videoEdits: Record<string, number> = {
  "30 seconds": 200,
  "60 seconds": 450,
  "2 minutes": 750,
  "5 minutes": 1500
};

const eventDeliverables: Record<string, number> = {
  "Edited Event Stream": 1500,
  "Edited Full Presentations Recorded": 1250,
  "Edited Event Recap Video": 1000,
  "Edited Attendee Testimonials": 750,
  "Edited Speaker Interviews": 900,
  "Edited Social Media Promo": 600
};

const addOns: Record<string, number | string> = {
  "Social Media Distribution Package": 500,
  "Photography": 500,
  "On-Screen Talent": 750,
  "Set Design": 1000,
  "Teleprompter": 350,
  "Additional Crew Member": 400
};

const preProductionServices: Record<string, number> = {
  "Scriptwriting": 200,
  "Storyboarding": 200,
  "Location Scouting": 200,
  "Talent Casting": 200,
  "Props and Wardrobe": 200
};

const deliverableTypes: Record<string, string[]> = {
  "commercial": ["TV Commercial", "Web Commercial", "Social Media Ad", "Product Demo"],
  "corporate-interview": ["Executive Interview", "Employee Testimonial", "Company Overview", "Thought Leadership"],
  "training": ["Instructional Video", "Safety Training", "Product Training", "Onboarding Video"]
};

const getProjectTypeDescription = (type: string): string => {
  switch (type) {
    case "event-video": return "Capture and showcase live events";
    case "commercial": return "Promote products or services";
    case "corporate-interview": return "Highlight company leadership and insights";
    case "training": return "Create educational content for employees or clients";
    default: return "Select a project type";
  }
};

const testimonials = [
  {
    name: "Valorie H.",
    company: "Video Production",
    text: "The video production they created for our leaders 25th Church Anniversary received a standing ovation!! The professionalism and continuous communication to make sure that the production was everything I envisioned for it to be. Truly 5 star in every aspect! Would definitely recommend them again and again!",
    rating: 5
  },
  {
    name: "Franchesca S.",
    company: "Marketing Videos",
    text: "Micah and his team were all of the above: Responsive, punctual, professional, provided valuable information and feedback and provided quality work. They've helped our IT company establish a look and feel for other video projects we do and we would/will definitely work with them again in the future. Micah was very helpful and informative through the entire process.",
    rating: 5
  },
  {
    name: "Lance K.",
    company: "Testimonial Videos",
    text: "It was great working with AUME for a video testimonial! The shots were of a high quality and Micah went above and beyond in terms of edits.",
    rating: 5
  }
];

const companyBlurb = "We've worked with the likes of Chick-fil-A, Toyota, SMU, Tiff's Treats, and many more. We believe we are talented and have great creative eyes; however, what makes us stand out has nothing to do with creative video production. It's the little things! We will always answer your call or email, we will show up to every gig on time and prepared, and we will always put your piece of mind over our bottom line.";

export function VideoQuoteCalculator() {
  const [formData, setFormData] = useState<FormDataType>({
    projectType: '',
    selectedGoals: [],
    projectDetails: '',
    eventDays: 1,
    eventCity: '',
    eventDeliverables: [],
    productionHours: 6,
    productionType: 'video',
    otherDeliverables: [{ duration: '', type: '' }],
    addOns: [],
    preProductionServices: [],
    quoteRequest: { name: '', email: '', phone: '', company: '', additionalInfo: '' }
  });
  const [priceEstimate, setPriceEstimate] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [expandedTestimonials, setExpandedTestimonials] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    calculatePriceEstimate();
  }, [formData]);

  const calculatePriceEstimate = () => {
    let totalCost = 0;

    if (formData.projectType === 'event-video') {
      if (typeof formData.productionHours === 'number') {
        totalCost = productionRates[formData.productionType][formData.productionHours] * formData.eventDays;
      }
      
      formData.eventDeliverables.forEach(deliverable => {
        if (deliverable in eventDeliverables) {
          totalCost += eventDeliverables[deliverable];
        }
      });
    } else {
      if (typeof formData.productionHours === 'number') {
        totalCost = productionRates[formData.productionType][formData.productionHours];
      }

      formData.otherDeliverables.forEach(deliverable => {
        if (deliverable.duration && deliverable.duration in videoEdits) {
          totalCost += videoEdits[deliverable.duration];
        }
      });
    }

    formData.addOns.forEach(addOn => {
      if (addOn in addOns && typeof addOns[addOn] === 'number') {
        totalCost += addOns[addOn] as number;
      }
    });

    formData.preProductionServices.forEach(service => {
      if (service in preProductionServices) {
        totalCost += preProductionServices[service];
      }
    });

    setPriceEstimate(totalCost);
  };

  const handleInputChange = (field: keyof FormDataType, value: DeliverableType[] | string | number) => {
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

  const handleOtherDeliverableChange = (index: number, field: keyof DeliverableType, value: string) => {
    setFormData(prev => {
      const newDeliverables = [...prev.otherDeliverables];
      newDeliverables[index] = { ...newDeliverables[index], [field]: value };
      return { ...prev, otherDeliverables: newDeliverables };
    });
  };

  const handleAddOnChange = (addOn: string) => {
    setFormData(prev => {
      if (addOn === 'None') {
        return { ...prev, addOns: [] };
      }
      const updatedAddOns = prev.addOns.includes(addOn)
        ? prev.addOns.filter(a => a !== addOn)
        : [...prev.addOns, addOn];
      return { ...prev, addOns: updatedAddOns };
    });
  };

  const handlePreProductionServiceChange = (service: string) => {
    setFormData(prev => {
      if (service === 'None') {
        return { ...prev, preProductionServices: [] };
      }
      const updatedServices = prev.preProductionServices.includes(service)
        ? prev.preProductionServices.filter(s => s !== service)
        : [...prev.preProductionServices, service];
      return { ...prev, preProductionServices: updatedServices };
    });
  };

  const handleQuoteRequestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      quoteRequest: { ...prev.quoteRequest, [name]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implement Zapier webhook submission here
    setShowThankYou(true);
    setShowSummary(false);
    setShowQuoteForm(false);
    scrollToTop();
    sendToZapier(formData);
  };

  const scrollToTop = () => {
    if (topRef.current) {
      if ('scrollTo' in window) {
        window.scrollTo({
          top: topRef.current.offsetTop,
          behavior: 'smooth'
        });
      } else {
        (window as Window).scrollTo(0, topRef.current.offsetTop);
      }
    }
  };

  const isFormComplete = () => {
    if (!formData.projectType || formData.selectedGoals.length === 0 || !formData.projectDetails) {
      return false;
    }

    if (formData.projectType === 'event-video') {
      return formData.eventDeliverables.length > 0;
    } else {
      return formData.otherDeliverables.some(d => d.type && d.duration);
    }
  };

  const renderProjectTypeSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Select Your Project Type</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projectTypes.map((type) => (
          <Button
            key={type.value}
            variant={formData.projectType === type.value ? "default" : "outline"}
            className="h-auto py-4 flex flex-col items-center justify-center text-center"
            onClick={() => handleInputChange('projectType', type.value)}
          >
            <span className="text-lg font-semibold w-full whitespace-normal">{type.label}</span>
            <span className="block text-sm text-gray-500 mt-1 px-2 w-full whitespace-normal">{getProjectTypeDescription(type.value)}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  const renderGoalSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Choose your goals for your project</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projectGoals[formData.projectType]?.map((goal: string) => (
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

  const renderProjectDetails = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Provide details about your project</h2>
      <div className="space-y-4">
        {formData.projectType === 'event-video' ? (
          <>
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
          </>
        ) : (
          <div>
            <Label htmlFor="productionHours" className="block mb-2">Production Hours</Label>
            <Select 
              value={formData.productionHours.toString()} 
              onValueChange={(value) => handleInputChange('productionHours', value === 'not-sure' ? 'not-sure' : parseInt(value))}
            >
              <SelectTrigger id="productionHours"><SelectValue placeholder="Select hours" /></SelectTrigger>
              <SelectContent>
                {Object.keys(productionRates.video).map(hours => (
                  <SelectItem key={hours} value={hours}>{hours} hours</SelectItem>
                ))}
                <SelectItem value="not-sure">I&apos;m not sure</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <Label htmlFor="productionType" className="block mb-2">Production Type</Label>
          <Select value={formData.productionType} onValueChange={(value) => handleInputChange('productionType', value as 'video' | 'photo' | 'photoVideo')}>
            <SelectTrigger id="productionType"><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="photo">Photo</SelectItem>
              <SelectItem value="photoVideo">Photo & Video</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Textarea
          placeholder="Share details about your vision, target audience, key messages, or any specific requirements..."
          value={formData.projectDetails}
          onChange={(e) => handleInputChange('projectDetails', e.target.value)}
          rows={6}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-500"
        />
      </div>
    </div>
  );

  const renderDeliverables = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">
        {formData.projectType === 'event-video' ? 'Event Videos' : 'Your Final Videos'}
      </h2>
      {formData.projectType === 'event-video' ? (
        <div>
          <p className="text-gray-600 mb-4">Select the edited videos you need for your event:</p>
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
        <div>
          <p className="text-gray-600 mb-4">Specify the details of your video deliverables:</p>
          {formData.otherDeliverables.map((deliverable, index) => (
            <Card key={index} className="p-4 mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <Film className="w-6 h-6 text-gray-500" />
                  </div>
                  <Select value={deliverable.type} onValueChange={(v) => handleOtherDeliverableChange(index, 'type', v)}>
                    <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="What type of video?" /></SelectTrigger>
                    <SelectContent>
                      {deliverableTypes[formData.projectType]?.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <Clock className="w-6 h-6 text-gray-500" />
                  </div>
                  <Select value={deliverable.duration} onValueChange={(v) => handleOtherDeliverableChange(index, 'duration', v)}>
                    <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="How long?" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(videoEdits).map(duration => (
                        <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          ))}
          <Button onClick={() => handleInputChange('otherDeliverables', [...formData.otherDeliverables, { duration: '', type: '' }])} variant="outline" className="w-full">
            Add Another Video
          </Button>
        </div>
      )}
    </div>
  );

  const renderAddOns = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Select any additional services needed</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className={`flex items-start space-x-2 bg-gray-50 p-3 rounded-lg cursor-pointer transition-colors ${
            formData.addOns.length === 0 ? 'bg-gray-200' : ''
          }`}
          onClick={() => handleAddOnChange('None')}
        >
          <Checkbox
            id="None"
            checked={formData.addOns.length === 0}
            onCheckedChange={() => handleAddOnChange('None')}
          />
          <div className="flex-grow">
            <Label htmlFor="None" className="font-medium">None</Label>
          </div>
        </div>
        {Object.keys(addOns).map((addOn: string) => (
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

  const renderPreProductionServices = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Select any pre-production services needed</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className={`flex items-start space-x-2 bg-gray-50 p-3 rounded-lg cursor-pointer transition-colors ${
            formData.preProductionServices.length === 0 ? 'bg-gray-200' : ''
          }`}
          onClick={() => handlePreProductionServiceChange('None')}
        >
          <Checkbox
            id="NonePreProduction"
            checked={formData.preProductionServices.length === 0}
            onCheckedChange={() => handlePreProductionServiceChange('None')}
          />
          <div className="flex-grow">
            <Label htmlFor="NonePreProduction" className="font-medium">None</Label>
          </div>
        </div>
        {Object.keys(preProductionServices).map((service: string) => (
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
            />
            <div className="flex-grow">
              <Label htmlFor={service} className="font-medium">{service}</Label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSummary = () => (
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
          {formData.projectType === 'event-video' ? (
            <>
              <div className="flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-gray-500 flex-shrink-0" />
                <h3 className="text-lg font-semibold">Event Details</h3>
              </div>
              <p><strong>Event Duration:</strong> {formData.eventDays} day(s)</p>
              <p><strong>Event Location:</strong> {formData.eventCity}</p>
              <Separator />
              <div className="flex items-center space-x-2">
                <Film className="w-6 h-6 text-gray-500 flex-shrink-0" />
                <h3 className="text-lg font-semibold">Event Videos</h3>
              </div>
              <ul className="list-disc list-inside">
                {formData.eventDeliverables.map(deliverable => (
                  <li key={deliverable}>{deliverable}</li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-gray-500 flex-shrink-0" />
                <h3 className="text-lg font-semibold">Project Details</h3>
              </div>
              <p>{formData.projectDetails}</p>
              <Separator />
              <div className="flex items-center space-x-2">
                <Film className="w-6 h-6 text-gray-500 flex-shrink-0" />
                <h3 className="text-lg font-semibold">Videos</h3>
              </div>
              <ul className="list-disc list-inside">
                {formData.otherDeliverables.map((deliverable, index) => (
                  <li key={index}>{deliverable.type} - {deliverable.duration}</li>
                ))}
              </ul>
            </>
          )}
          <Separator />
          <div className="flex items-center space-x-2">
            <Camera className="w-6 h-6 text-gray-500 flex-shrink-0" />
            <h3 className="text-lg font-semibold">Add-Ons</h3>
          </div>
          {formData.addOns.length > 0 ? (
            <ul className="list-disc list-inside">
              {formData.addOns.map(addOn => (
                <li key={addOn}>{addOn}</li>
              ))}
            </ul>
          ) : (
            <p>No additional services selected</p>
          )}
          <Separator />
          <div className="flex items-center space-x-2">
            <Clapperboard className="w-6 h-6 text-gray-500 flex-shrink-0" />
            <h3 className="text-lg font-semibold">Pre-Production Services</h3>
          </div>
          {formData.preProductionServices.length > 0 ? (
            <ul className="list-disc list-inside">
              {formData.preProductionServices.map(service => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          ) : (
            <p>No pre-production services selected</p>
          )}
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold">Estimated Price</h3>
              </div>
              <p className="text-2xl font-bold">${priceEstimate.toLocaleString()}</p>
            </div>
            <AlertCircle className="w-6 h-6 text-gray-500" />
          </div>
        </div>
      </Card>
      <Button onClick={() => setShowQuoteForm(true)} className="w-full">Confirm Quote</Button>
    </div>
  );

  const renderQuoteForm = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Confirm Your Quote</h2>
      <p className="text-gray-600">Please fill out your information below to confirm your project quote.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.quoteRequest.name}
            onChange={handleQuoteRequestChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.quoteRequest.email}
            onChange={handleQuoteRequestChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.quoteRequest.phone}
            onChange={handleQuoteRequestChange}
          />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            value={formData.quoteRequest.company}
            onChange={handleQuoteRequestChange}
          />
        </div>
        <div>
          <Label htmlFor="additionalInfo">Additional Information</Label>
          <Textarea
            id="additionalInfo"
            name="additionalInfo"
            value={formData.quoteRequest.additionalInfo}
            onChange={handleQuoteRequestChange}
            rows={4}
          />
        </div>
        <Button type="submit" className="w-full">Confirm Quote</Button>
      </form>
    </div>
  );

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
        {testimonials.slice(0, expandedTestimonials ? testimonials.length : 1).map((testimonial, index) => (
          <div
            key={index}
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
          </div>
        ))}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">About AUME Motion Arts</h3>
          <p className="text-sm text-gray-600">{companyBlurb}</p>
        </div>
      </div>
    </Card>
  );

  const renderThankYou = () => (
    <div className="space-y-6 text-center">
      <h2 className="text-3xl font-bold text-gray-800">Thank You!</h2>
      <p className="text-xl text-gray-600">We&apos;ve received your quote request and will be in touch shortly.</p>
      <Button onClick={() => {
        setShowThankYou(false);
        setFormData({
          projectType: '',
          selectedGoals: [],
          projectDetails: '',
          eventDays: 1,
          eventCity: '',
          eventDeliverables: [],
          productionHours: 6,
          productionType: 'video',
          otherDeliverables: [{ duration: '', type: '' }],
          addOns: [],
          preProductionServices: [],
          quoteRequest: { name: '', email: '', phone: '', company: '', additionalInfo: '' }
        });
      }} className="mt-4">
        Start New Quote
      </Button>
    </div>
  );

  const shouldShowPreProduction = () => {
    return formData.projectType !== 'event-video' && 
           formData.selectedGoals.length > 0 && 
           formData.projectDetails && 
           formData.otherDeliverables.some(d => d.type && d.duration);
  };

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div ref={topRef} className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Video Quote Calculator</h1>
          </div>
          {showThankYou ? (
            renderThankYou()
          ) : !showSummary ? (
            <>
              <div className="space-y-8">
                {renderProjectTypeSelection()}
                {formData.projectType && renderGoalSelection()}
                {formData.selectedGoals.length > 0 && renderProjectDetails()}
                {formData.projectDetails && renderDeliverables()}
                {(formData.eventDeliverables.length > 0 || formData.otherDeliverables.some(d => d.type && d.duration)) && renderAddOns()}
                {shouldShowPreProduction() && renderPreProductionServices()}
                {isFormComplete() && (
                  <Button onClick={() => {
                    sendToZapier(formData);
                    setShowSummary(true);
                    scrollToTop();
                  }} className="w-full">Generate Quote</Button>
                )}
              </div>
              
            </>
          ) : (
            <div className="space-y-6">
              {renderSummary()}
              {showQuoteForm && renderQuoteForm()}
            </div>
          )}
          {renderTestimonialsAndAbout()}
        </CardContent>
      </Card>
    </div>
  );
}