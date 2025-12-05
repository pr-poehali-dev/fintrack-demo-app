import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  limit: number;
}

interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: Date;
}

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Продукты', icon: 'ShoppingCart', color: '#0EA5E9', limit: 15000 },
    { id: '2', name: 'Транспорт', icon: 'Car', color: '#8B5CF6', limit: 5000 },
    { id: '3', name: 'Развлечения', icon: 'Gamepad2', color: '#F97316', limit: 10000 },
    { id: '4', name: 'Здоровье', icon: 'Heart', color: '#EC4899', limit: 8000 },
    { id: '5', name: 'Коммуналка', icon: 'Home', color: '#10B981', limit: 7000 },
    { id: '6', name: 'Одежда', icon: 'Shirt', color: '#F59E0B', limit: 12000 },
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', categoryId: '1', amount: 2500, description: 'Покупка в супермаркете', date: new Date('2024-12-03') },
    { id: '2', categoryId: '2', amount: 500, description: 'Метро', date: new Date('2024-12-04') },
    { id: '3', categoryId: '3', amount: 1800, description: 'Кино с друзьями', date: new Date('2024-12-04') },
    { id: '4', categoryId: '1', amount: 3200, description: 'Продукты на неделю', date: new Date('2024-12-05') },
    { id: '5', categoryId: '4', amount: 2100, description: 'Аптека', date: new Date('2024-12-05') },
  ]);

  const [newExpense, setNewExpense] = useState({
    categoryId: '',
    amount: '',
    description: '',
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyBudget = categories.reduce((sum, cat) => sum + cat.limit, 0);
  const budgetUsed = (totalSpent / monthlyBudget) * 100;

  const getCategoryExpenses = (categoryId: string) => {
    return expenses
      .filter(exp => exp.categoryId === categoryId)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsEditCategoryOpen(true);
  };

  const handleSaveCategory = () => {
    if (!editingCategory) return;
    
    setCategories(categories.map(c => 
      c.id === editingCategory.id ? editingCategory : c
    ));
    setIsEditCategoryOpen(false);
    setEditingCategory(null);
    toast.success('Категория обновлена');
  };

  const handleAddExpense = () => {
    if (!newExpense.categoryId || !newExpense.amount || !newExpense.description) {
      toast.error('Заполните все поля');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      categoryId: newExpense.categoryId,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: new Date(),
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({ categoryId: '', amount: '', description: '' });
    setIsDialogOpen(false);
    
    const category = categories.find(c => c.id === expense.categoryId);
    const categoryTotal = getCategoryExpenses(expense.categoryId) + expense.amount;
    
    if (category && categoryTotal >= category.limit * 0.9) {
      toast.warning(`Внимание! Вы приближаетесь к лимиту категории "${category.name}"`);
    } else {
      toast.success('Расход добавлен');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Мои Финансы</h1>
            <p className="text-muted-foreground mt-1">Контроль личных расходов</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 hover:scale-105 transition-transform">
                <Icon name="Plus" size={20} />
                Добавить расход
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый расход</DialogTitle>
                <DialogDescription>Добавьте информацию о расходе</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Категория</Label>
                  <Select value={newExpense.categoryId} onValueChange={(value) => setNewExpense({...newExpense, categoryId: value})}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <Icon name={cat.icon as any} size={16} />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Сумма (₽)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0" 
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Input 
                    id="description" 
                    placeholder="На что потрачено?" 
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  />
                </div>
                <Button className="w-full" onClick={handleAddExpense}>
                  Сохранить
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Редактировать категорию</DialogTitle>
                <DialogDescription>Измените название и лимит категории</DialogDescription>
              </DialogHeader>
              {editingCategory && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Название</Label>
                    <Input 
                      id="edit-name" 
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-limit">Месячный лимит (₽)</Label>
                    <Input 
                      id="edit-limit" 
                      type="number"
                      value={editingCategory.limit}
                      onChange={(e) => setEditingCategory({...editingCategory, limit: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <Button className="w-full" onClick={handleSaveCategory}>
                    Сохранить изменения
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="animate-fade-in hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего потрачено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalSpent.toLocaleString('ru-RU')} ₽</div>
              <p className="text-xs text-muted-foreground mt-2">за текущий месяц</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover:shadow-lg transition-shadow" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Месячный бюджет</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{monthlyBudget.toLocaleString('ru-RU')} ₽</div>
              <p className="text-xs text-muted-foreground mt-2">запланировано</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover:shadow-lg transition-shadow" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Осталось</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{(monthlyBudget - totalSpent).toLocaleString('ru-RU')} ₽</div>
              <Progress value={budgetUsed} className="mt-3" />
              <p className="text-xs text-muted-foreground mt-2">{budgetUsed.toFixed(1)}% использовано</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories" className="gap-2">
              <Icon name="FolderOpen" size={16} />
              Категории
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Icon name="History" size={16} />
              История
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <Icon name="PieChart" size={16} />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {categories.map(category => {
                const spent = getCategoryExpenses(category.id);
                const percentage = (spent / category.limit) * 100;
                const isNearLimit = percentage >= 90;
                
                return (
                  <Card key={category.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg" style={{ backgroundColor: category.color + '20' }}>
                            <Icon name={category.icon as any} size={24} style={{ color: category.color }} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            <CardDescription>Лимит: {category.limit.toLocaleString('ru-RU')} ₽</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isNearLimit && (
                            <Badge variant="destructive" className="gap-1">
                              <Icon name="AlertTriangle" size={12} />
                              Лимит
                            </Badge>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Icon name="Settings" size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Потрачено</span>
                          <span className="font-semibold">{spent.toLocaleString('ru-RU')} ₽</span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className={isNearLimit ? 'bg-destructive/20' : ''}
                        />
                        <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}% от лимита</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Последние транзакции</CardTitle>
                <CardDescription>История ваших расходов</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenses.map(expense => {
                    const category = categories.find(c => c.id === expense.categoryId);
                    if (!category) return null;
                    
                    return (
                      <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: category.color + '20' }}>
                            <Icon name={category.icon as any} size={20} style={{ color: category.color }} />
                          </div>
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <p className="text-sm text-muted-foreground">{category.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">-{expense.amount.toLocaleString('ru-RU')} ₽</p>
                          <p className="text-xs text-muted-foreground">
                            {expense.date.toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Распределение по категориям</CardTitle>
                  <CardDescription>Визуализация расходов</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.map(category => {
                      const spent = getCategoryExpenses(category.id);
                      const percentage = totalSpent > 0 ? (spent / totalSpent) * 100 : 0;
                      
                      return (
                        <div key={category.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                              <span>{category.name}</span>
                            </div>
                            <span className="font-semibold">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%`, backgroundColor: category.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Статус бюджета</CardTitle>
                  <CardDescription>Использование лимитов</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <div className="text-5xl font-bold text-primary mb-2">
                        {budgetUsed.toFixed(0)}%
                      </div>
                      <p className="text-sm text-muted-foreground">бюджета использовано</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="flex items-center gap-2">
                          <Icon name="CheckCircle" size={20} className="text-green-600" />
                          <span className="text-sm font-medium">Категорий в норме</span>
                        </div>
                        <span className="font-bold text-green-600">
                          {categories.filter(c => (getCategoryExpenses(c.id) / c.limit) * 100 < 90).length}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <div className="flex items-center gap-2">
                          <Icon name="AlertTriangle" size={20} className="text-orange-600" />
                          <span className="text-sm font-medium">Близко к лимиту</span>
                        </div>
                        <span className="font-bold text-orange-600">
                          {categories.filter(c => (getCategoryExpenses(c.id) / c.limit) * 100 >= 90).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;